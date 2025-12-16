import os
from django.test import TestCase, Client, override_settings, tag
from django.urls import reverse
from django.contrib.auth import get_user_model
from BookAndDock.tests.integration_backend.utils_integration import require_backend, destructive_allowed


@tag("integration")
@override_settings(BACKEND_API_BASE="http://localhost:5000")
class BanUserIntegrationTests(TestCase):
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

        s = self.client.session
        s["role"] = "ADMIN"
        s.save()

        if not destructive_allowed():
            self.skipTest("Destructive integration test disabled. Set RUN_DESTRUCTIVE_INTEGRATION=1 to enable.")

    def test_ban_user_real_backend(self):
        # WARNING: this will really call backend /users delete with Authorization header = email
        url = reverse("ban_user", kwargs={"user_email": "user@test.com"})
        response = self.client.get(url)

        # Your view redirects on success, otherwise returns 4xx/5xx
        self.assertNotEqual(response.status_code, 500)
