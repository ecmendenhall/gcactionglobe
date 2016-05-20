import server
import unittest
import json
from server import get_ip_coordinates
import mock

class ServerTests(unittest.TestCase):

    def setUp(self):
        server.app.config['TESTING'] = True
        self.app = server.app.test_client()
        self.context_data = {
            'context': {
                'ip': '74.101.51.84'
            }
        }
        self.json = json.dumps(self.context_data)

    def tearDown(self):
        server.WEBSOCKETS = []

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

    def test_webhook_notifies_websockets(self):
        fake_websocket = mock.MagicMock()
        server.receive(fake_websocket)
        response = self.app.post(
            '/webhook',
            data=self.json,
            content_type='application/json'
        )
        lat_lon = {'lat': 40.9126, 'lon': -73.8371}
        fake_websocket.send.assert_called_with(lat_lon)

class GeoIPTests(unittest.TestCase):

    def test_returns_lat_lon_for_ip(self):
        coordinates = get_ip_coordinates('74.101.51.84')
        self.assertEqual(coordinates, (40.9126, -73.8371))

    @mock.patch('server.geolite2')
    def test_returns_lat_lon_for_ip(self, geolite2):
        geolite2.lookup.return_value = None
        coordinates = get_ip_coordinates('74.101.51.84')
        self.assertEqual(coordinates, (38.0000,-97.0000))

class WebsocketTests(unittest.TestCase):

    def test_receive_route_adds_socket_to_observers(self):
        fake_websocket = mock.MagicMock()
        server.receive(fake_websocket)
        self.assertEqual(1, len(server.WEBSOCKETS))

if __name__ == '__main__':
    unittest.main()
