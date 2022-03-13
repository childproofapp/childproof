import time
import xlwt
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By

from xlwt import *
from xlutils.copy import copy # http://pypi.python.org/pypi/xlutils
from xlrd import *
import xlrd


options = webdriver.ChromeOptions() 
options.add_experimental_option('excludeSwitches', ['enable-logging'])
browser = webdriver.Chrome("C:/Users/Mirek/Desktop/Homebrew/python/97/chromedriver.exe",options=options)

browser.maximize_window()

print("Spuštění prohlížeče....")
time.sleep(3)


loc = "C:/Users/Mirek/Desktop/imgcheck/File.xls"
xfile = xlrd.open_workbook(loc)
xfile.sheet_by_index(0)
sheet = xfile.sheet_by_index(0)

filepath = "C:/Users/Mirek/Desktop/imgcheck/File.xls"
w = copy(open_workbook(filepath))
sheet_write = w.get_sheet(0)


wb = xlwt.Workbook()
sheet1 = wb.add_sheet('Data')


print(sheet.nrows)


for i in range(sheet.nrows):
    browser.get(sheet.cell_value(i, 1))
    value = sheet.cell_value(i, 0)
    url_address = sheet.cell_value(i,1)
    print("Checking images in article: " + value)
    time.sleep(5)

    try:
        img_srcs = browser.find_elements(By.TAG_NAME, "img")

        for image in img_srcs:
            imgpath = image.get_attribute("src")

            if "sdk-docs-staging" in imgpath:
                try:
                    print("WRONG IMAGE FOUND: "+ imgpath)
                    sheet1.write(i-1, 0, value)
                    sheet1.write(i-1, 1, url_address)
                    sheet1.write(i-1, 2, "CHYBA")
                    wb.save("artikly" + '.xls')
                except Exception:
                    print("Vice obrazku spatne")

            time.sleep(1)

        
        browser.close()
        time.sleep(3)
        print("Otviram " + sheet.cell_value(i+1, 0))
        browser = webdriver.Chrome("C:/Users/Mirek/Desktop/Homebrew/python/97/chromedriver.exe",options=options)
        

    except NoSuchElementException:
        print("No images")
        browser.close()
        time.sleep(3)
        browser = webdriver.Chrome(options=options, executable_path=r"C:/Users/Mirek/Desktop/Homebrew/python/97/chromedriver.exe")
        browser.get(sheet.cell_value(i, 1))
        time.sleep(1)

    
