module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/email-template/test',
      handler: 'email-template.testEmail',
      config: {
        auth: false,
        description: 'Test email functionality',
        tags: ['Email Test']
      }
    },
    {
      method: 'GET',
      path: '/email-template/test-direct',
      handler: 'email-template.testDirectEmail',
      config: {
        auth: false,
        description: 'Test email with direct nodemailer',
        tags: ['Email Test']
      }
    }
  ]
}; 