from django.test import TestCase, Client, override_settings, tag
from django.urls import reverse
from django.contrib.auth import get_user_model
from BookAndDock.tests.integration_backend.utils_integration import require_backend


@tag("integration")
@override_settings(BACKEND_API_BASE="http://localhost:5000")
class GuideAdminIntegrationTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        require_backend(cls)

        User = get_user_model()
        User.objects.create_user(username="admin", password="pass123")
        cls.admin_username = "admin"
        cls.admin_password = "pass123"

    def setUp(self):
        self.client = Client()
        self.client.login(username=self.admin_username, password=self.admin_password)

        session = self.client.session
        session["role"] = "ADMIN"
        session.save()

    def test_manage_guides_view_renders(self):
        url = reverse("manage_guides")
        response = self.client.get(url)

        self.assertNotEqual(response.status_code, 500)
        self.assertEqual(response.status_code, 200)
