Task: Add optional YouTube video support for Local News while keeping the same UI and logic everywhere.

Context:
The project has three news types:

- Local News (manual articles from admin panel)
- World News (API based)
- Football News (API based)

This change must apply ONLY to Local News. Do NOT modify World News or Football News.

Current Local News fields:

- headline
- summary
- content
- image
- category = local

This already works correctly for publishing text articles.

Goal:
Allow Local News to be published either as:

1. a text article
2. a video article

while keeping the same UI and behavior across the entire site.

---

1. Admin Panel

Keep the current UI exactly the same.

Existing fields must remain:

- Headline
- Summary
- Content
- Image

Add one optional field:

YouTube Video URL (optional)

Example input:
https://www.youtube.com/watch?v=VIDEO_ID
or
https://youtu.be/VIDEO_ID

Publishing logic:

TEXT ARTICLE
Uses:

- headline
- summary
- content
- image

VIDEO ARTICLE
Uses:

- headline
- summary
- image
- video_url

If video_url exists:

- treat the article as a video article
- content can be empty.

If video_url does not exist:

- behave exactly like the current text article system.

---

2. Home Page / Dashboard Cards

The card layout must remain exactly the same:

- image
- headline
- summary

Do NOT embed video in cards.

Cards must behave exactly the same whether the article is text or video.

Clicking the card must open the article exactly the same way as today.

---

3. Article View (Modal or Article Page)

Keep the same UI and layout.

Render order:

Image

Video (ONLY if video_url exists)

Headline

Summary

Content (only if it exists)

Comments

Embed the video using YouTube iframe:

https://www.youtube.com/embed/VIDEO_ID

The video must play directly on the page and must NOT redirect to YouTube.

---

4. Article URL Page

The logic must be exactly the same as the modal/article view.

Video articles and text articles must use the same layout and comment system.

---

5. Important Constraints

Do NOT modify:

- World News logic
- Football News logic
- API fetching
- routing
- comment system
- existing UI styling
- homepage card layout

Only extend Local News so it supports optional YouTube video articles.

Everything else must behave exactly the same as before.
