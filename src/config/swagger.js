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
      description: 'API endpoints for Ministries and Sermons',
    },
    servers: [
      {
        url: appUrl,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      schemas: {
        // Nested schema used inside Ministry
        Action: {
          type: 'object',
          required: ['label', 'type'],
          properties: {
            label: { type: 'string', description: 'Button label' },
            link: { type: 'string', description: 'Link or action URL' },
            info: { type: 'string', description: 'Additional info' },
            type: {
              type: 'string',
              enum: ['primary', 'secondary', 'info'],
              description: 'Button style'
            }
          }
        },

        // ── Ministry ─────────────────────────────────────────────────────────
        // Used for GET responses: image fields are absolute URL strings
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

        // Used for POST/PUT request bodies: headImage is a file upload
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
            // NOTE: actions must be sent as a JSON string when using multipart/form-data
            // e.g. actions: '[{"label":"Join","type":"primary"}]'
            actions:   { type: 'string', description: 'JSON-stringified array of Action objects (required when sending multipart/form-data)' },
          },
        },

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
            title:     { type: 'string' },
            location:  { type: 'string' },
            image:     { type: 'string', format: 'binary', description: 'Event image (JPEG/PNG/WebP, max 10MB) — auto-compressed to WebP' },
            date:      { type: 'string' },
            time:      { type: 'string' }
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