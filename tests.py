import server
import unittest
import json

class ServerTests(unittest.TestCase):

    def setUp(self):
        server.app.config['TESTING'] = True
        self.app = server.app.test_client()
        self.context_data = {
            'context': {
                'ip': '123.45.67.89'
            }
        }
        self.json = json.dumps(self.context_data)

    def test_returns_hello_world(self):
        response = self.app.get('/')
        assert 'Hello world!' in str(response.data)

    def test_webhook_returns_activity_ip(self):
        response = self.app.post(
            '/webhook',
            data=self.json,
            content_type='application/json'
        )
        assert self.context_data['context']['ip'] in str(response.data)

if __name__ == '__main__':
    unittest.main()
