import base64
import requests

# Consumer Key and Secret
consumer_key = 'JZ1VYmTrIRzAP5wnpqWIfa09zjffsvFdk6PC9lwqkkCQbmsu'
consumer_secret = 'cvwI7nSKz77KfnFaHNAArJkvqHDvg7l7tMpIyhBmXU2TjhpkJl5G6AEV7bWYKPiD'

# Generate the credentials string
credentials = base64.b64encode(f'{consumer_key}:{consumer_secret}'.encode('utf-8')).decode('utf-8')

# Access token request URL
url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

# Send the request
headers = {
    'Authorization': f'Basic {credentials}'
}

response = requests.get(url, headers=headers)
data = response.json()

# Get the Access Token from the response
access_token = data.get('access_token')
print(f'Access Token: {access_token}')
