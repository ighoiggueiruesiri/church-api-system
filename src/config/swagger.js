const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// ─── Dynamic server URL — driven entirely by .env, never hardcoded ────────────
// Local dev:   APP_URL=http://localhost:5000
// cPanel:      APP_URL=https://yourdomain.com
// AWS / other: APP_URL=https://api.yourdomain.com
const appUrl = (process.env.APP_URL || 'http://localhost:5000').replace(/\/$/, '');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Church API Documentation',
      version: '1.0.0',
      description: 'API endpoints for Ministries, Sermons, Events, Testimonies, Blogs and Projects',
    },
    servers: [
      {
        url: appUrl,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      schemas: {

        // ── Shared nested schema ──────────────────────────────────────────────
        Action: {
          type: 'object',
          required: ['label', 'type'],
          properties: {
            label: { type: 'string', description: 'Button label' },
            link:  { type: 'string', description: 'Link or action URL' },
            info:  { type: 'string', description: 'Additional info' },
            type: {
              type: 'string',
              enum: ['primary', 'secondary', 'info'],
              description: 'Button style'
            }
          }
        },

        // ── Ministry ─────────────────────────────────────────────────────────
        Ministry: {
          type: 'object',
          required: ['title', 'desc'],
          properties: {
            _id:       { type: 'string', description: 'Auto-generated MongoDB ID' },
            title:     { type: 'string', description: 'Ministry name (unique)' },
            desc:      { type: 'string', description: 'Short description' },
            headName:  { type: 'string' },
            headImage: { type: 'string', description: 'Absolute URL of the head image (returned in responses)' },
            headTitle: { type: 'string' },
            icon:      { type: 'string' },
            color:     { type: 'string' },
            bg:        { type: 'string' },
            border:    { type: 'string' },
            fullDesc:  { type: 'string', description: 'Detailed description (max 2000 chars)' },
            actions:   { type: 'array', items: { $ref: '#/components/schemas/Action' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        MinistryInput: {
          type: 'object',
          required: ['title', 'desc'],
          properties: {
            title:     { type: 'string' },
            desc:      { type: 'string' },
            headName:  { type: 'string' },
            headImage: { type: 'string', format: 'binary', description: 'Upload image file (JPEG/PNG/WebP/GIF, max 10 MB) — stored as compressed WebP' },
            headTitle: { type: 'string' },
            icon:      { type: 'string' },
            color:     { type: 'string' },
            bg:        { type: 'string' },
            border:    { type: 'string' },
            fullDesc:  { type: 'string' },
            actions:   { type: 'string', description: 'JSON-stringified array of Action objects (required when sending multipart/form-data)' },
          },
        },

        // ── Sermon ───────────────────────────────────────────────────────────
        Sermon: {
          type: 'object',
          required: ['title', 'pastor'],
          properties: {
            _id:       { type: 'string' },
            title:     { type: 'string', description: 'The title of the sermon (unique)' },
            pastor:    { type: 'string', description: 'The name of the pastor' },
            date:      { type: 'string' },
            thumbnail: { type: 'string' },
            videoId:   { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        SermonInput: {
          type: 'object',
          required: ['title', 'pastor'],
          properties: {
            title:     { type: 'string' },
            pastor:    { type: 'string' },
            date:      { type: 'string' },
            thumbnail: { type: 'string', format: 'binary', description: 'Thumbnail image (JPEG/PNG/WebP, max 10MB) — auto-compressed to WebP' },
            videoId:   { type: 'string' }
          }
        },

        // ── Event ────────────────────────────────────────────────────────────
        Event: {
          type: 'object',
          required: ['title', 'location'],
          properties: {
            _id:       { type: 'string' },
            title:     { type: 'string', description: 'The title of the event (unique)' },
            location:  { type: 'string' },
            date:      { type: 'string' },
            time:      { type: 'string' },
            image:     { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        EventInput: {
          type: 'object',
          required: ['title', 'location'],
          properties: {
            title:    { type: 'string' },
            location: { type: 'string' },
            image:    { type: 'string', format: 'binary', description: 'Event image (JPEG/PNG/WebP, max 10MB) — auto-compressed to WebP' },
            date:     { type: 'string' },
            time:     { type: 'string' }
          }
        },

        // ── Testimony ────────────────────────────────────────────────────────
        // GET response — avatar is a resolved URL string
        Testimony: {
          type: 'object',
          required: ['name', 'text'],
          properties: {
            _id:       { type: 'string', description: 'Auto-generated MongoDB ID' },
            name:      { type: 'string', description: 'Testifier name (e.g. "Sarah O.")' },
            role:      { type: 'string', description: 'Role or membership info (e.g. "Member since 2020")' },
            text:      { type: 'string', description: 'The testimony text (max 2000 chars)' },
            avatar:    { type: 'string', description: 'Initials string OR absolute URL of avatar image' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        // POST/PUT request body — avatar can be an uploaded file OR a plain string (initials)
        TestimonyInput: {
          type: 'object',
          required: ['name', 'text'],
          properties: {
            name:   { type: 'string' },
            role:   { type: 'string' },
            text:   { type: 'string' },
            avatar: {
              type: 'string',
              format: 'binary',
              description: 'Optional avatar image (JPEG/PNG/WebP, max 10MB). If omitted, supply initials as a plain string field instead.'
            }
          }
        },

        // ── Blog ─────────────────────────────────────────────────────────────
        Blog: {
          type: 'object',
          required: ['title'],
          properties: {
            _id:         { type: 'string', description: 'Auto-generated MongoDB ID' },
            title:       { type: 'string', description: 'Blog post title (unique)' },
            date:        { type: 'string', description: 'Display date (e.g. "Feb 18, 2026")' },
            excerpt:     { type: 'string', description: 'Short preview text (max 500 chars)' },
            image:       { type: 'string', description: 'Absolute URL of the cover image' },
            fullContent: { type: 'string', description: 'Full blog post body' },
            createdAt:   { type: 'string', format: 'date-time' },
            updatedAt:   { type: 'string', format: 'date-time' }
          }
        },

        BlogInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title:       { type: 'string' },
            date:        { type: 'string' },
            excerpt:     { type: 'string' },
            image:       { type: 'string', format: 'binary', description: 'Cover image (JPEG/PNG/WebP, max 10MB) — auto-compressed to WebP' },
            fullContent: { type: 'string' }
          }
        },

        // ── Project ──────────────────────────────────────────────────────────
        Project: {
          type: 'object',
          required: ['title', 'desc'],
          properties: {
            _id:       { type: 'string', description: 'Auto-generated MongoDB ID' },
            title:     { type: 'string', description: 'Project title (unique)' },
            desc:      { type: 'string', description: 'Project description (max 2000 chars)' },
            image:     { type: 'string', description: 'Absolute URL of the project image' },
            link:      { type: 'string', description: 'External link (e.g. WhatsApp support link)' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        ProjectInput: {
          type: 'object',
          required: ['title', 'desc'],
          properties: {
            title: { type: 'string' },
            desc:  { type: 'string' },
            image: { type: 'string', format: 'binary', description: 'Project image (JPEG/PNG/WebP, max 10MB) — auto-compressed to WebP' },
            link:  { type: 'string', description: 'External link (e.g. WhatsApp, donation page)' }
          }
        },

      }
    }
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('📄 Swagger Docs available at http://localhost:5000/api-docs');
};

module.exports = swaggerDocs;
