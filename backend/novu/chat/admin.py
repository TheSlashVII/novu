from django.contrib import admin
from userAPI.models import Message

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender_id','content', 'sent_at')
    list_filter = ['sent_at']
    search_fields = ('sender_id__email', 'content')
    readonly_fields = ('sent_at',)
    
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Mensaje'