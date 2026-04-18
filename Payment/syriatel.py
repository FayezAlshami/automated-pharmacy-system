"""
طلب POST بسيط لـ customerHistory — نفس الهيدر والبودي من التدفق.
"""

import sys

import requests

URL = "https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/ePayment/customerHistory"

HEADERS = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 16; SM-A165F Build/BP2A.250605.031.A3)",
    "Host": "cash-api.syriatel.sy",
    "Connection": "Keep-Alive",
    "Accept-Encoding": "gzip",
}

DATA = {
    "appVersion": "5.6.0",
    "pageNumber": "1",
    "searchGsmOrSecret": "",
    "type": "2",
    "systemVersion": "Android+v16",
    "deviceId": "ffffffff-ffac-6da9-ffff-ffffef05ac4a",
    "userId": "5473040",
    "sortType": "1",
    "mobileManufaturer": "samsung",
    "mobileModel": "SM-A165F",
    "channelName": "4",
    "lang": "0",
    "hash": "81a26f2fd8381e0c759e37b1700b93f9f8a9bc8d1f61bb794de01f765cd44a26",
    "status": "2",
}


def main():
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass
    r = requests.post(URL, headers=HEADERS, data=DATA, timeout=60)
    print(r.status_code)
    print(r.text)


if __name__ == "__main__":
    main()
