import shutil
import sys
import cv2
import numpy as np
import base64
import json
import datetime
import os
import urllib.request
import re
import requests
import ssl
import certifi
import fitz
import docx
import validators
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO
from pathlib import Path
import requests
import xml.etree.ElementTree as ET
import requests

def getUrls():
    # URL of the sitemap.xml file
    sitemap_url = "https://wu-rg.github.io/sitemap.xml"

    # Fetching the sitemap.xml content
    response = requests.get(sitemap_url)

    if response.status_code == 200:
        xml_content = response.text

        # Parse the XML content
        root = ET.fromstring(xml_content)

        # Extract the URLs from the XML
        namespaces = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        url_elements = root.findall(".//ns:loc", namespaces=namespaces)
        url_list = [element.text for element in url_elements]

        # Print the extracted URLs
        for url in url_list:
            print(url)
        return url_list
    else:
        print(f"Failed to fetch the sitemap - Response code: {response.status_code}")

def sendPost(urls: list):
    # POST 요청을 보낼 URL
    url = "https://www.bing.com/indexnow?url=http://wu-rg.github.io/product.html&key=3549c745ec924d25bd9594cc1d1f060d"

    # 요청에 포함될 데이터
    data = {
        "host": "wu-rg.github.io",
        "key": "3549c745ec924d25bd9594cc1d1f060d",
        "keyLocation": "https://wu-rg.github.io/3549c745ec924d25bd9594cc1d1f060d.txt",
        "urlList": urls
    }

    # POST 요청 보내기
    response = requests.post(url, json=data)

    # 응답 처리
    if response.status_code == 200:
        print("POST 요청이 성공적으로 전송되었습니다.")
    else:
        print(f"POST 요청 전송 실패 - 응답 코드: {response.status_code}")

sendPost(getUrls())