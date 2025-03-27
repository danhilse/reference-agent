import json
import requests
import os
from datetime import datetime

def get_salesforce_data(config_file=None, save_output=True):
    """
    Fetch customer reference data directly from Salesforce API
    
    Args:
        config_file (str): Optional path to JSON config file with credentials
        save_output (bool): Whether to save JSON output to file
        
    Returns:
        list: The processed customer reference data
    """
    # Get Salesforce credentials - either from config file or environment variables
    if config_file and os.path.exists(config_file):
        with open(config_file, 'r') as f:
            config = json.load(f)
            client_id = config.get('client_id')
            client_secret = config.get('client_secret')
            username = config.get('username')
            password = config.get('password')
            report_id = config.get('report_id', '00OVP000002IlDp2AK')  # Default if not specified
    else:
        # Use environment variables if no config file
        client_id = os.environ.get('SF_CLIENT_ID')
        client_secret = os.environ.get('SF_CLIENT_SECRET')
        username = os.environ.get('SF_USERNAME')
        password = os.environ.get('SF_PASSWORD')
        report_id = os.environ.get('SF_REPORT_ID', '00OVP000002IlDp2AK')  # Default if not specified
    
    # Step 1: Authenticate with Salesforce using the custom domain
    # Use the custom domain instead of login.salesforce.com
    auth_url = 'https://acton.my.salesforce.com/services/oauth2/token'
    
    # If you're using a sandbox, use this URL instead:
    # auth_url = 'https://acton--sandbox.my.salesforce.com/services/oauth2/token'
    
    auth_data = {
        'grant_type': 'password',
        'client_id': client_id,
        'client_secret': client_secret,
        'username': username,
        'password': password
    }
    
    print("Authenticating with Salesforce...")
    print(f"Using auth URL: {auth_url}")
    
    try:
        response = requests.post(auth_url, data=auth_data)
        
        if response.status_code != 200:
            print(f"Authentication failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            print("\nTroubleshooting steps:")
            print("1. Verify your client_id and client_secret are correct")
            print("2. Make sure your Connected App in Salesforce is properly configured")
            print("3. Check if your user has API access enabled")
            print("4. Try using 'https://test.salesforce.com/services/oauth2/token' for sandboxes")
            return None
        
        auth_response = response.json()
        access_token = auth_response.get('access_token')
        instance_url = auth_response.get('instance_url')
        
        print(f"Authentication successful. Instance URL: {instance_url}")
        
        # Step 2: Fetch report data
        report_url = f"{instance_url}/services/data/v63.0/analytics/reports/{report_id}"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        print(f"Fetching report data for report ID: {report_id}...")
        response = requests.get(report_url, headers=headers)
        
        if response.status_code != 200:
            print(f"Report fetch failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return None
        
        report_data = response.json()
        
        # Step 3: Process the report data
        result = []
        
        # First, let's examine the structure to better understand the data
        if 'reportMetadata' not in report_data:
            print("Warning: Expected report structure not found.")
            print("Here's a sample of the returned data structure:")
            print(json.dumps(list(report_data.keys())[:10], indent=2))
            
        # Extract column metadata to map indices to field names
        columns = []
        if 'reportMetadata' in report_data and 'detailColumns' in report_data['reportMetadata']:
            columns = report_data['reportMetadata']['detailColumns']
            print(f"Found {len(columns)} columns in the report")
        
        # Process the report data from the factMap 
        fact_map = report_data.get('factMap', {})
        
        for key, data in fact_map.items():
            if not key.endswith('!T'):  # Skip totals
                for row in data.get('rows', []):
                    row_data = {}
                    
                    for i, cell in enumerate(row.get('dataCells', [])):
                        # Get column name using the index
                        if i < len(columns):
                            column_name = columns[i]
                            # Try to get a readable label from metadata
                            if 'reportExtendedMetadata' in report_data and 'detailColumnInfo' in report_data['reportExtendedMetadata']:
                                column_info = report_data['reportExtendedMetadata']['detailColumnInfo'].get(column_name, {})
                                label = column_info.get('label', column_name)
                                row_data[label] = cell.get('label', '')
                            else:
                                row_data[column_name] = cell.get('label', '')
                    
                    # Map report columns to our desired JSON format
                    # Note: You may need to adjust the field names based on your actual report structure
                    entry = {
                        "customerName": row_data.get("Customer Reference: Customer Reference Name", ""),
                        "accountName": row_data.get("Account: Account Name", ""),
                        "referenceType": row_data.get("Type of Reference", ""),
                        "approvedForPublicUse": row_data.get("Approved for Public Use") == "1",
                        "useCase": row_data.get("Use Case", ""),
                        "capability": row_data.get("Capability/Feature", ""),
                        "caseStudyLink": row_data.get("Case Study Link", ""),
                        "crm": row_data.get("CRM", ""),
                        "customerContact": row_data.get("Customer Contact", ""),
                        "referenceDetail": row_data.get("Reference Detail", ""),
                        "referenceSlideLink": row_data.get("Reference Slide Link", ""),
                        "industry": row_data.get("Account: Industry", ""),
                        "marketSegment": row_data.get("Account: Market Segment", ""),
                        "verified": row_data.get("Account: Verified CRM", "")
                    }
                    
                    result.append(entry)
        
        # If we didn't get any data through the standard approach, add some diagnostic code
        if not result:
            print("No data found using standard processing. Examining report structure...")
            if 'factMap' in report_data:
                print("FactMap keys:", list(report_data['factMap'].keys()))
            else:
                print("No factMap found in the response")
                
            # Try to print some useful debug information about the structure
            print("\nHere's a sample of the report data structure to help diagnose:")
            print("Top-level keys:", list(report_data.keys()))
            
        # Step 4: Save to JSON if requested
        if save_output and result:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"customer_references_{timestamp}.json"
            
            with open(output_file, 'w', encoding='utf-8') as output_file_handle:
                json.dump(result, output_file_handle, indent=2)
            
            print(f"Saved {len(result)} records to {output_file}")
        
        return result
    
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

# Example usage
if __name__ == "__main__":
    # Option 1: Use a config file for credentials (more secure than hardcoding)
    config_file = "sf_config.json"

    
    # Option 2: Use environment variables (better for production)
    # Make sure to set these environment variables:
    # - SF_CLIENT_ID
    # - SF_CLIENT_SECRET  
    # - SF_USERNAME
    # - SF_PASSWORD
    # - SF_REPORT_ID (optional, uses default if not set)
    
    # Get the data
    data = get_salesforce_data(config_file)
    
    # Print the first entry as a sample
    if data and len(data) > 0:
        print("\nSample of first entry:")
        print(json.dumps(data[0], indent=2))