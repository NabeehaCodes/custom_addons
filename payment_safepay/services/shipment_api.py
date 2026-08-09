# import requests


# def create_shipment(
#     api_url,
#     api_key,
#     order_id,
#     customer_name,
#     phone,
#     email,
#     street,
#     city,
#     zip_code,
#     delivery_method,
#     weight,
# ):
#     url = f"{api_url.rstrip('/')}/shipments"

#     headers = {
#         "Content-Type": "application/json",
#         "X-API-KEY": api_key,
#     }

#     data = {
#         "order_id": order_id,
#         "customer_name": customer_name,
#         "phone": phone,
#         "email": email,
#         "street": street,
#         "city": city,
#         "zip_code": zip_code,
#         "delivery_method": delivery_method,
#         "weight": weight,
#     }

#     print("=================================")
#     print("CREATING SHIPMENT")
#     print("Shipment API URL:", url)
#     print("Order ID:", order_id)
#     print("Customer:", customer_name)
#     print("Delivery Method:", delivery_method)
#     print("Weight:", weight)
#     print("=================================")

#     response = requests.post(
#         url,
#         json=data,
#         headers=headers,
#         timeout=30,
#     )

#     print("Shipment API status:", response.status_code)
#     print("Shipment API response:", response.text)

#     response.raise_for_status()

#     return response.json()


# def get_shipment(
#     api_url,
#     api_key,
#     tracking_number,
# ):
#     url = (
#         f"{api_url.rstrip('/')}"
#         f"/shipments/{tracking_number}"
#     )

#     headers = {
#         "X-API-KEY": api_key,
#     }

#     response = requests.get(
#         url,
#         headers=headers,
#         timeout=30,
#     )

#     response.raise_for_status()

#     return response.json()


# def update_shipment_status(
#     api_url,
#     api_key,
#     tracking_number,
#     status,
# ):
#     url = (
#         f"{api_url.rstrip('/')}"
#         f"/shipments/{tracking_number}/status"
#     )

#     headers = {
#         "Content-Type": "application/json",
#         "X-API-KEY": api_key,
#     }

#     data = {
#         "status": status,
#     }

#     response = requests.put(
#         url,
#         json=data,
#         headers=headers,
#         timeout=30,
#     )

#     response.raise_for_status()

#     return response.json()



import requests


def create_shipment(
    api_url,
    api_key,
    order_id,
    customer_name,
    phone,
    email,
    street,
    city,
    zip_code,
    delivery_method,
    weight,
):
    url = f"{api_url.rstrip('/')}/shipments"

    headers = {
        "Content-Type": "application/json",
        "X-API-KEY": api_key,
    }

    data = {
        "order_id": order_id,
        "customer_name": customer_name,
        "phone": phone,
        "email": email,
        "street": street,
        "city": city,
        "zip_code": zip_code,
        "delivery_method": delivery_method,
        "weight": weight,
    }

    print("=================================")
    print("CREATING SHIPMENT")
    print("Shipment API URL:", url)
    print("Order ID:", order_id)
    print("Customer:", customer_name)
    print("Delivery Method:", delivery_method)
    print("Weight:", weight)
    print("=================================")

    response = requests.post(
        url,
        json=data,
        headers=headers,
        timeout=30,
    )

    print("Shipment API status:", response.status_code)
    print("Shipment API response:", response.text)

    # -------------------------------------------------
    # Handle normal success
    # -------------------------------------------------

    if response.status_code == 200 or response.status_code == 201:
        return response.json()

    # -------------------------------------------------
    # Handle "shipment already exists"
    # -------------------------------------------------

    try:
        result = response.json()
    except ValueError:
        response.raise_for_status()
        raise

    tracking_number = result.get("tracking_number")

    if (
        response.status_code == 400
        and tracking_number
        and "already exists" in result.get("message", "").lower()
    ):
        print("Shipment already exists.")
        print("Existing tracking number:", tracking_number)

        # Treat the existing shipment as usable.
        return {
            "success": True,
            "already_exists": True,
            "shipment_id": result.get("shipment_id"),
            "tracking_number": tracking_number,
            "status": result.get("status", "Created"),
            "message": result.get(
                "message",
                "Shipment already exists.",
            ),
        }

    # -------------------------------------------------
    # Any other API error
    # -------------------------------------------------

    response.raise_for_status()

    return result


def get_shipment(
    api_url,
    api_key,
    tracking_number,
):
    url = (
        f"{api_url.rstrip('/')}"
        f"/shipments/{tracking_number}"
    )

    headers = {
        "X-API-KEY": api_key,
    }

    response = requests.get(
        url,
        headers=headers,
        timeout=30,
    )

    print("=================================")
    print("GETTING SHIPMENT")
    print("Shipment API URL:", url)
    print("Tracking Number:", tracking_number)
    print("=================================")

    print("Shipment API status:", response.status_code)
    print("Shipment API response:", response.text)

    response.raise_for_status()

    return response.json()


def update_shipment_status(
    api_url,
    api_key,
    tracking_number,
    status,
):
    url = (
        f"{api_url.rstrip('/')}"
        f"/shipments/{tracking_number}/status"
    )

    headers = {
        "Content-Type": "application/json",
        "X-API-KEY": api_key,
    }

    data = {
        "status": status,
    }

    print("=================================")
    print("UPDATING SHIPMENT STATUS")
    print("Shipment API URL:", url)
    print("Tracking Number:", tracking_number)
    print("New Status:", status)
    print("=================================")

    response = requests.put(
        url,
        json=data,
        headers=headers,
        timeout=30,
    )

    print("Shipment API status:", response.status_code)
    print("Shipment API response:", response.text)

    response.raise_for_status()

    return response.json()
