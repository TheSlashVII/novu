from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class Message(models.Model):
    "Modelo para mensajes entre usuarios"
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_messages'
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-timestamp']  # Los más nuevos primero
        indexes = [
            models.Index(fields=['sender', 'recipient']),
            models.Index(fields=['timestamp']),
        ]
    
    def __str__(self):
        return f"{self.sender.username} -> {self.recipient.username}: {self.content[:30]}"
    
    def mark_as_read(self):
        """Marca el mensaje como leído"""
        if not self.is_read:
            self.is_read = True
            self.save(update_fields=['is_read'])