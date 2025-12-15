from unittest.mock import patch, Mock
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model


class EditorOnlyTests(TestCase):
    def setUp(self):
        self.client = Client()
        User = get_user_model()
        User.objects.create_user(username="editor", password="pass123")
        self.client.login(username="editor", password="pass123")

        # Your views branch on this in manage_guides()
        session = self.client.session
        session["role"] = "EDITOR"
        session.save()

    # ---------- manage_guides (editor branch) ----------
    @patch("BookAndDock.views.requests.get")
    def test_manage_guides_as_editor_renders_profile_guides(self, mock_get):
        # manage_guides calls requests.get twice in your code
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [
            {"id": 1, "title": "Published Guide", "content": "x",
             "guideStatus": "PUBLISHED", "guideCategory": "GUIDE", "images": []},
            {"id": 2, "title": "Pending Article", "content": "y",
             "guideStatus": "TO_BE_ACCEPTED", "guideCategory": "ARTICLE", "images": []},
        ]

        url = reverse("manage_guides")
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, 200)
        # Editor branch renders profile_guides.html
        self.assertTemplateUsed(resp, "profile_guides.html")

    # ---------- guide_detail_editor ----------
    @patch("BookAndDock.views.requests.get")
    def test_guide_detail_editor_fetches_guide_and_renders(self, mock_get):
        """
        guide_detail_editor does:
          - GET /guides/{id}
          - for each image id: GET /images/{image_id}
        We'll mock both using side_effect.
        """
        def fake_get(url, *args, **kwargs):
            m = Mock()

            if "/guides/" in url:
                m.status_code = 200
                m.json.return_value = {
                    "id": 10,
                    "title": "Editor Guide",
                    "content": "Hello",
                    "publicationDate": "2025-12-15T10:00:00",
                    "images": [123],  # triggers image fetch loop
                    "comments": [],
                }
                return m

            if "/images/123" in url:
                m.status_code = 200
                # your code expects dict with base64 JSON string inside
                m.json.return_value = {
                    "base64Image": '{"base64Image":"iVBORw0KGgoAAAANSUhEUgAAAAUA"}'
                }
                return m

            m.status_code = 404
            m.json.return_value = {}
            return m

        mock_get.side_effect = fake_get

        url = reverse("guide_detail_editor", kwargs={"guide_id": 10})
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, 200)
        self.assertTemplateUsed(resp, "editor-guide/guide_detail.html")
        self.assertContains(resp, "Editor Guide")

    # ---------- profile_guides (editor’s own guides by authorId) ----------
    @patch("BookAndDock.views.fetch_image_urls", autospec=True)
    @patch("BookAndDock.views.requests.get")
    def test_profile_guides_as_editor(self, mock_get, mock_fetch_image_urls):
        """
        profile_guides uses:
          GET /guides/author/{user_id}
          then fetch_image_urls(images)
        We'll mock fetch_image_urls to avoid extra HTTP.
        """
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [
            {"id": 1, "title": "My Published Guide", "guideStatus": "PUBLISHED", "guideCategory": "GUIDE", "images": [1]},
            {"id": 2, "title": "My Draft Guide", "guideStatus": "DRAFT", "guideCategory": "GUIDE", "images": []},
            {"id": 3, "title": "My Pending Guide", "guideStatus": "TO_BE_ACCEPTED", "guideCategory": "GUIDE", "images": [2, 3]},
        ]
        mock_fetch_image_urls.return_value = ["data:image/png;base64,xxx"]

        url = reverse("profile_guides")
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, 200)
        self.assertTemplateUsed(resp, "profile_guides.html")
        self.assertContains(resp, "My Published Guide")

    # ---------- delete_guide_editor (editor deletes external guide) ----------
    @patch("BookAndDock.views.requests.delete")
    @patch("BookAndDock.views.requests.get")
    def test_delete_guide_editor_redirects_to_profile_guides_for_guide(self, mock_get, mock_delete):
        # First GET fetches guideCategory
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"guideCategory": "GUIDE"}

        # Then DELETE actually deletes
        mock_delete.return_value.status_code = 204

        url = reverse("delete_guide_editor", kwargs={"guide_id": 55})
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, 302)
        self.assertEqual(resp.url, reverse("profile_guides"))

    @patch("BookAndDock.views.requests.delete")
    @patch("BookAndDock.views.requests.get")
    def test_delete_guide_editor_redirects_to_profile_articles_for_article(self, mock_get, mock_delete):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"guideCategory": "ARTICLE"}
        mock_delete.return_value.status_code = 200

        url = reverse("delete_guide_editor", kwargs={"guide_id": 56})
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, 302)
        self.assertEqual(resp.url, reverse("profile_articles"))

    # ---------- add_guide (editor GET) ----------
    def test_add_guide_get_renders_form(self):
        # Keep this simple: it avoids dealing with GuideForm validation & file uploads
        url = reverse("add_guide")
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, 200)
        self.assertTemplateUsed(resp, "editor-guide/add_guide.html")
