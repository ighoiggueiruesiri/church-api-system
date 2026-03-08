const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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
        url: 'http://localhost:5000',
        description: 'Development server',
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

        Ministry: {
          type: 'object',
          required: ['title', 'desc'],
          properties: {
            _id: { type: 'string', description: 'The auto-generated id of the ministry' },
            title: { type: 'string', description: 'The name of the ministry (unique)' },
            desc: { type: 'string', description: 'Short description of the ministry' },
            headName: { type: 'string' },
            headImage: { type: 'string' },
            headTitle: { type: 'string' },
            icon: { type: 'string' },
            color: { type: 'string' },
            bg: { type: 'string' },
            border: { type: 'string' },
            fullDesc: { type: 'string', description: 'Detailed description (max 2000 chars)' },
            actions: {
              type: 'array',
              items: { $ref: '#/components/schemas/Action' }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        Sermon: {
          type: 'object',
          required: ['title', 'pastor'],
          properties: {
            _id: { type: 'string', description: 'The auto-generated id of the sermon' },
            title: { type: 'string', description: 'The title of the sermon (unique)' },
            pastor: { type: 'string', description: 'The name of the pastor' },
            date: { type: 'string' },
            thumbnail: { type: 'string' },
            videoId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          } 
        },

        Event: {
          type: 'object',
          required: ['title', 'location'],
          properties: {
            _id: { type: 'string', description: 'The auto-generated id of the sermon' },
            title: { type: 'string', description: 'The title of the event (unique)' },
            location: { type: 'string', description: 'The location of the event' },
            date: { type: 'string' },
            time: { type: 'string' },
            image: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
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