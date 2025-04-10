import json
import requests
import os
from datetime import datetime

def get_salesforce_data_direct(config_file=None, save_path="public/data.json"):
    """
    Fetch customer reference data directly from Salesforce objects instead of reports
    """
    # Get Salesforce credentials from config file
    if config_file and os.path.exists(config_file):
        with open(config_file, 'r') as f:
            config = json.load(f)
            client_id = config.get('client_id')
            client_secret = config.get('client_secret')
            username = config.get('username')
            password = config.get('password')
    else:
        # Use environment variables if no config file
        client_id = os.environ.get('SF_CLIENT_ID')
        client_secret = os.environ.get('SF_CLIENT_SECRET')
        username = os.environ.get('SF_USERNAME')
        password = os.environ.get('SF_PASSWORD')
    
    # Authenticate with Salesforce
    auth_url = 'https://acton.my.salesforce.com/services/oauth2/token'
    
    auth_data = {
        'grant_type': 'password',
        'client_id': client_id,
        'client_secret': client_secret,
        'username': username,
        'password': password
    }
    
    print("Authenticating with Salesforce...")
    
    try:
        response = requests.post(auth_url, data=auth_data)
        
        if response.status_code != 200:
            print(f"Authentication failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return None
        
        auth_response = response.json()
        access_token = auth_response.get('access_token')
        instance_url = auth_response.get('instance_url')
        
        print(f"Authentication successful. Instance URL: {instance_url}")
        
        # Based on the report metadata, build a query for the Customer_Reference__c object
        # We'll use the fields we saw in the report metadata
        field_list = [
            "Name", 
            "Account__r.Name",
            "Type_of_Reference__c",
            "Approved_for_Public_Use__c",
            "Use_Case__c",
            "Capability_Feature__c",
            "Case_Study_Link__c",
            "CRM__c",
            "Customer_Contact__c",
            "Reference_Detail__c",
            "Reference_Slide_Link__c",
            "Account__r.Industry",
            "Account__r.Market_Segment_Static__c",
            "Account__r.CRM__c"
        ]
        
        # Build SOQL query
        soql_query = f"SELECT {','.join(field_list)} FROM Customer_Reference__c WHERE Approved_for_Public_Use__c = true"
        
        # Encode the query
        import urllib.parse
        encoded_query = urllib.parse.quote(soql_query)
        
        # Execute the query
        query_url = f"{instance_url}/services/data/v63.0/query?q={encoded_query}"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        print(f"Executing SOQL query: {soql_query}")
        
        response = requests.get(query_url, headers=headers)
        
        if response.status_code != 200:
            print(f"Query failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return None
        
        query_result = response.json()
        records = query_result.get('records', [])
        
        print(f"Found {len(records)} customer reference records")
        
        # Process records into the desired format
        result = []
        for record in records:
            # Helper function to get a value or empty string if null/None
            def get_value(obj, key, default=""):
                value = obj.get(key, default)
                return value if value is not None else ""
            
            # Helper function for nested objects
            def get_nested_value(obj, parent_key, child_key, default=""):
                parent = obj.get(parent_key, {})
                if parent is None:
                    return default
                value = parent.get(child_key, default)
                return value if value is not None else ""
            
            # Map Salesforce fields to the desired output format
            entry = {
                "customerName": get_value(record, "Name"),
                "accountName": get_nested_value(record, "Account__r", "Name"),
                "referenceType": get_value(record, "Type_of_Reference__c"),
                "approvedForPublicUse": record.get("Approved_for_Public_Use__c", False),
                "useCase": get_value(record, "Use_Case__c"),
                "capability": get_value(record, "Capability_Feature__c"),
                "caseStudyLink": get_value(record, "Case_Study_Link__c"),
                "crm": get_value(record, "CRM__c"),
                "customerContact": get_value(record, "Customer_Contact__c"),
                "referenceDetail": get_value(record, "Reference_Detail__c"),
                "referenceSlideLink": get_value(record, "Reference_Slide_Link__c"),
                "industry": get_nested_value(record, "Account__r", "Industry"),
                "marketSegment": get_nested_value(record, "Account__r", "Market_Segment_Static__c"),
                "verified": get_nested_value(record, "Account__r", "CRM__c")
            }
            
            # Only include entries where approvedForPublicUse is true
            if entry["approvedForPublicUse"]:
                result.append(entry)
        
        # Save the results to JSON file
        if result:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            
            # Use custom JSON encoder to ensure nulls are converted to empty strings
            class CustomEncoder(json.JSONEncoder):
                def default(self, obj):
                    if obj is None:
                        return ""
                    return super().default(obj)
            
            with open(save_path, 'w', encoding='utf-8') as output_file:
                json.dump(result, output_file, indent=2, cls=CustomEncoder)
            
            print(f"Saved {len(result)} records to {save_path}")
        else:
            print("No records found or no records approved for public use.")
        
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
    
    # Save to the specified path
    save_path = "public/data.json"
    
    # Get the data
    data = get_salesforce_data_direct(config_file, save_path)
    
    # Print the first entry as a sample
    if data and len(data) > 0:
        print("\nSample of first entry:")
        print(json.dumps(data[0], indent=2))
    else:
        print("\nNo data was returned.")