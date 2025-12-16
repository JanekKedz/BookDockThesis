from django.test import TestCase, Client, override_settings, tag
from django.urls import reverse
from django.contrib.auth import get_user_model
from BookAndDock.tests.integration_backend.utils_integration import require_backend, destructive_allowed


@tag("integration")
@override_settings(BACKEND_API_BASE="http://localhost:5000")
class EditorPostsIntegrationTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        require_backend(cls)

        User = get_user_model()
        User.objects.create_user(username="editor", password="pass123")
        cls.editor_username = "editor"
        cls.editor_password = "pass123"

    def setUp(self):
        self.client = Client()
        self.client.login(username=self.editor_username, password=self.editor_password)

        session = self.client.session
        session["role"] = "EDITOR"
        session.save()

        if not destructive_allowed():
            self.skipTest("Destructive integration test disabled. Set RUN_DESTRUCTIVE_INTEGRATION=1 to enable.")

    def test_add_guide_post_hits_real_backend(self):
        url = reverse("add_guide")
        payload = {
            "title": "Integration Guide",
            "description": "Created by integration test",
            "links": "https://a.com\nhttps://b.com",
            "category": "guide",
            "status": "to_be_accepted",
        }
        resp = self.client.post(url, data=payload)

        # view usually redirects after save
        self.assertIn(resp.status_code, (302, 303, 200))
        self.assertNotEqual(resp.status_code, 500)
