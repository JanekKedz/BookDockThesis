from unittest.mock import patch
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from BookAndDock.models import Guide
from unittest.mock import patch, Mock
from django.test import tag

@tag("unit")
class EditorOnlyTests(TestCase):
    def setUp(self):
        self.client = Client()
        User = get_user_model()
        User.objects.create_user(username="editor", password="pass123")
        self.client.login(username="editor", password="pass123")

        session = self.client.session
        session["role"] = "EDITOR"
        session.save()

    @patch("BookAndDock.views.requests.post")
    def test_add_guide_post_creates_guide_and_cleans_links(self, mock_post):
        # prevent real HTTP call to localhost:5000
        mock_post.return_value.status_code = 201

        url = reverse("add_guide")
        payload = {
            "title": "My New Guide",
            "description": "Some description",
            "links": "https://a.com\nhttps://b.com, https://c.com",
            "category": "guide",
            "status": "to_be_accepted",
        }

        resp = self.client.post(url, data=payload)
        self.assertIn(resp.status_code, (302, 303))

        g = Guide.objects.get(title="My New Guide")
        self.assertEqual(g.created_by.username, "editor")
        self.assertEqual(g.category, "guide")
        self.assertEqual(g.status, "TO_BE_ACCEPTED")
        self.assertEqual(g.links, ["https://a.com", "https://b.com", "https://c.com"])

    def test_add_guide_post_invalid_missing_title_stays_on_form(self):
        url = reverse("add_guide")
        payload = {
            "title": "",
            "description": "Some description",
            "links": "https://a.com",
            "category": "guide",
            "status": "draft",
        }

        resp = self.client.post(url, data=payload)
        self.assertEqual(resp.status_code, 200)
        self.assertTemplateUsed(resp, "editor-guide/add_guide.html")

    @patch("BookAndDock.views.requests.get")
    def test_modify_guide_get_renders_form(self, mock_get):
        # Mock external API response for GET /guides/{pk}
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            "title": "External Title",
            "content": "External content",
            "guideStatus": "DRAFT",
            "guideCategory": "GUIDE",
            "links": ["https://x.com"],
        }

        pk = 123
        url = reverse("modify_guide", kwargs={"pk": pk})
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, 200)
        self.assertTemplateUsed(resp, "editor-guide/modify_guide.html")
        self.assertContains(resp, "External Title")

    @patch("BookAndDock.views.requests.put")
    @patch("BookAndDock.views.requests.get")
    def test_modify_guide_post_updates_fields_and_links(self, mock_get, mock_put):
        # Mock initial external fetch
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            "title": "External Title",
            "content": "External content",
            "guideStatus": "DRAFT",
            "guideCategory": "GUIDE",
            "links": [],
        }

        # Mock sync PUT /guides/{pk}
        mock_put.return_value.status_code = 200
        mock_put.return_value.raise_for_status = Mock()

        pk = 123
        url = reverse("modify_guide", kwargs={"pk": pk})
        payload = {
            "title": "New Title",
            "description": "New desc",
            "links": "https://new1.com, https://new2.com",
            "category": "guide",
            "status": "to_be_accepted",
        }

        resp = self.client.post(url, data=payload)

        self.assertIn(resp.status_code, (302, 303))

        # The view stores it as external_id=pk
        g = Guide.objects.get(external_id=pk)
        self.assertEqual(g.title, "New Title")
        self.assertEqual(g.description, "New desc")
        self.assertEqual(g.status, "to_be_accepted")
        self.assertEqual(g.links, ["https://new1.com", "https://new2.com"])

        mock_put.assert_called_once()
