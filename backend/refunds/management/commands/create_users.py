from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Create initial users for development"

    def handle(self, *args, **kwargs):
        users_data = [
            {"username": "admin1", "password": "admin1", "is_staff": True},
            {"username": "admin2", "password": "admin2", "is_staff": True},
            {"username": "user1", "password": "user1", "is_staff": False},
            {"username": "user2", "password": "user2", "is_staff": False},
        ]

        for user_data in users_data:
            username = user_data["username"]

            if User.objects.filter(username=username).exists():
                self.stdout.write(self.style.WARNING(f"{username} already exists"))
                continue

            user = User.objects.create_user(
                username=username,
                password=user_data["password"],
            )

            user.is_staff = user_data["is_staff"]
            user.save()

            self.stdout.write(self.style.SUCCESS(f"Created {username}"))

        self.stdout.write(self.style.SUCCESS("Seeding complete."))
