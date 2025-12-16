from django.test import TestCase, Client, override_settings, tag
from django.urls import reverse
from django.contrib.auth import get_user_model
from BookAndDock.tests.integration_backend.utils_integration import require_backend, destructive_allowed


@tag("integration")
@override_settings(BACKEND_API_BASE="http://localhost:5000")
class EditorOnlyIntegrationTests(TestCase):
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

    def test_manage_guides_as_editor_renders(self):
        url = reverse("manage_guides")
        resp = self.client.get(url)
        self.assertNotEqual(resp.status_code, 500)
        self.assertEqual(resp.status_code, 200)

    def test_add_guide_get_renders_form(self):
        url = reverse("add_guide")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)

    def test_delete_guide_editor_guarded(self):
        if not destructive_allowed():
            self.skipTest("Destructive integration test disabled. Set RUN_DESTRUCTIVE_INTEGRATION=1 to enable.")

        url = reverse("delete_guide_editor", kwargs={"guide_id": 1})
        resp = self.client.get(url)
        self.assertNotEqual(resp.status_code, 500)
