import jwt            # Requires PyJWT: pip install pyjwt
import time
import requests

# === Configuration ===
# Connected App Consumer Key (Client ID)
CONSUMER_KEY = "3MVG99OxTyEMCQ3gcPr9LJRZ0Kg5JmhrzTaAMgboLP7GvzEgYG9KFnhR6zig8vyqqcaMD3bARLQPvbF.nUMd1"

# Salesforce API user you wish to authenticate as
USERNAME = "infinitstudios@act-on.com"

# Audience URL (use test.salesforce.com for sandbox, https://login.salesforce.com for production)
AUDIENCE = "https://login.salesforce.com"

# JWT expiration time in seconds (typically less than 300 seconds)
JWT_EXPIRATION_SECONDS = 300

# Provide the RSA Private Key directly as a multi-line string.
# Replace the contents below with your actual private key in PEM format.
PRIVATE_KEY = """
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEArI3XK2PT3VJD3F6/JVY5H...
... (your private key contents here) ...
-----END RSA PRIVATE KEY-----
"""

# Report details (if you want to download a Salesforce report)
REPORT_ID = "00OVP000002IlDp2AK"
API_VERSION = "v63.0"


def create_jwt_assertion():
    """Creates a JWT assertion signed with the provided private key."""
    payload = {
        "iss": CONSUMER_KEY,                           # Connected app consumer key
        "sub": USERNAME,                               # Salesforce username (API user)
        "aud": AUDIENCE,                               # Salesforce login URL
        "exp": int(time.time()) + JWT_EXPIRATION_SECONDS # Expiration time (UNIX timestamp)
    }
    # Sign the JWT using RS256 algorithm with the provided private key.
    jwt_assertion = jwt.encode(payload, PRIVATE_KEY, algorithm="RS256")
    return jwt_assertion


def get_access_token(jwt_assertion):
    """Exchanges the JWT assertion for a Salesforce access token."""
    token_url = "https://login.salesforce.com/services/oauth2/token"
    params = {
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion": jwt_assertion
    }
    response = requests.post(token_url, data=params)
    response.raise_for_status()  # Raise an error for bad responses
    return response.json()


def download_report(access_token, instance_url, report_id):
    """Downloads report data from Salesforce using the Reports REST API."""
    endpoint = f"{instance_url}/services/data/{API_VERSION}/analytics/reports/{report_id}"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    response = requests.get(endpoint, headers=headers)
    response.raise_for_status()
    return response.json()


def main():
    try:
        # Generate JWT assertion
        jwt_assertion = create_jwt_assertion()

        # Exchange the JWT for an access token
        token_response = get_access_token(jwt_assertion)
        access_token = token_response.get("access_token")
        instance_url = token_response.get("instance_url")

        print("Successfully obtained access token:")
        print(access_token)
        print("Instance URL:")
        print(instance_url)

        # (Optional) Download a report using the access token:
        report_data = download_report(access_token, instance_url, REPORT_ID)
        print("\nReport Data:")
        print(report_data)

    except Exception as e:
        print("An error occurred:")
        print(e)


if __name__ == "__main__":
    main()