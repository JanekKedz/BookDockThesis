import json
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model


class AuthViewsTests(TestCase):

    def setUp(self):
        self.client = Client()

    def test_admin_custom_login_success(self):
        """
        Admin login should succeed and set session role to ADMIN
        """
        url = reverse("custom_login")

        payload = {
            "email": "admin@test.com",
            "username": "admin",
            "name": "Admin",
            "surname": "User",
            "role": "ADMIN",
        }

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.session.get("role"), "ADMIN")

        User = get_user_model()
        self.assertTrue(User.objects.filter(username="admin").exists())

    def test_admin_custom_login_rejects_non_admin(self):
        """
        Admin login must reject non-admin role
        """
        url = reverse("custom_login")

        payload = {
            "email": "x@test.com",
            "username": "x",
            "role": "EDITOR",
        }

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 403)

    def test_editor_custom_login_success(self):
        """
        Editor login should succeed and set session role to EDITOR
        """
        url = reverse("custom_login_editor")

        payload = {
            "email": "editor@test.com",
            "username": "editor",
            "name": "Editor",
            "surname": "User",
            "role": "EDITOR",
        }

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.session.get("role"), "EDITOR")

        User = get_user_model()
        self.assertTrue(User.objects.filter(username="editor").exists())

    def test_editor_custom_login_rejects_non_editor(self):
        """
        Editor login must reject non-editor role
        """
        url = reverse("custom_login_editor")

        payload = {
            "email": "x@test.com",
            "username": "x",
            "role": "ADMIN",
        }

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 403)
