# myfoodangels

search - /get_latest_merchant_products?page[number]=1&page[size]=10&category_id=[param]
get product - /get_products_of_merchant_urewards?merchant_id={merchant_id}&page[number]={page_number}&page[size]={page_size}

login - /customer_phone_auth_session
Method: POST
body {email, merchant_id}

register - /add_user_for_merchant/${process.env.NEXT_PUBLIC_MERCHANT_ID}”
method POST
body

 {  "data": 
    {
        "first_name": data?.firstname,
        "last_name": data.lastname,
        "email":authDetails?.email,
        "phone_number": data?.phone,
        "date_of_birth": "01-01-1980",
        "sex": "M",
        "local_db_created_at": "NIL",
        "address_line1": data?.address,
        "address_line2": "NIL",
        "postcode": Number(data?.zipcode),
        "state": data.state,
        "country": data.country 
    }
}

/sales

{
    // business_branch_id: null,
    card_payment_ref: null,
    created_at: new Date().getMilliseconds(),
    discount_amount: null,
    has_discount: false,
    is_paid_with_card: true,
    is_paid_with_cash: false,
    is_paid_with_customer_account: false,
    is_paid_with_mobile: false,
    is_paid_with_mtransfer: false,
    is_paid_with_point: false,
    loyalty_id: null,
    mtier_amount: null,
    payment_reference: reference,
    reference_code: new Date().getMilliseconds(),
    shared_loyalty_txn: false,
    user_id: Number(loystarUserId),
    merchant_id: merchantId,
    transactions: orderedItem,
}, 
    
    array of ordered items[{
            product_id: Number(item?.loystarId),
            quantity:
               Array.isArray(item?.units) && item?.units?.length > 0
                  ? Number(item?.no_of_items || 0) * Number(item?.loystarUnitQty || 0)
                  : Number(item?.no_of_items),
            user_id: Number(loystarUserId),
            amount: item?.price,
            merchant_id: merchantId,
            created_at: new Date().toISOString(),
            has_custom_qty: Array.isArray(item?.units) && item?.units?.length > 0 ? true : false,
            id: Number(item?.loystarId),
            merchant_product_category_id: item?.category?.loystarId,
            name: item?.name,
            price: item?.price,
            product_type: "product",
            track_inventory: true,
            unit: "units",
            updated_at: new Date().toISOString(),
            publish_to_loystar_shop: true,
            bundle_products: [],
            bundles: [],
            // business_branch_id: null,
            custom_quantities: item?.units,
         }];



Headers

{
  "access-control-allow-origin": "*",
  "access-token": "361XExK649JmWq9mVNYT1A",
  "authorization": "Bearer eyJhY2Nlc3MtdG9rZW4iOiIzNjFYRXhLNjQ5Sm1XcTltVk5ZVDFBIiwidG9rZW4tdHlwZSI6IkJlYXJlciIsImNsaWVudCI6Ikp6cVgyR0lvek9CWVhZNXQ5cm81NXciLCJleHBpcnkiOiIxODIxMDI4NTAzIiwidWlkIjoibXlmb29kYW5nZWxzQGdtYWlsLmNvbSJ9",
  "cache-control": "max-age=0, private, must-revalidate",
  "client": "JzqX2GIozOBYXY5t9ro55w",
  "content-length": "1883",
  "content-type": "application/json; charset=utf-8",
  "date": "Wed, 17 Sep 2025 17:15:03 GMT",
  "etag": "W/\"efc1351cc0202de49802fe84045a16f4\"",
  "expiry": "1821028503",
  "token-type": "Bearer",
  "uid": "myfoodangels@gmail.com",
  "vary": "Origin",
  "x-final-url": "https://api.loystar.co/api/v2/auth/sign_in",
  "x-request-id": "28bc5c4a-ac28-4e42-aa20-08d1db70f0b7",
  "x-runtime": "0.247846"
}

