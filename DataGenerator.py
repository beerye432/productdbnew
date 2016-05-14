import sys
import os
import string
import random
import time

def RanStringGen(size, chars=string.ascii_letters+string.digits, unique=False, unique_list=[]):
    st = ''.join(random.choice(chars) for _ in range(size))
    if unique == True:
        if st in unique_list:
            return RanStringGen(size, chars, True, unique_list)
    return st

def RanIntegerGen(start, end, unique=False, unique_list=[]):
    num = random.randint(start, end)
    if unique == True:
        if num in unique_list:
            return RanIntegerGen(start, end, True, unique_list)
    return num

def RanFloatGen(start, end):
    return random.uniform(start, end)

def RanRoleGen():
    role = ['o', 'c']
    return random.choice(role)

def RanStateGen():
    state = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DC", "DE", "FL", "GA", 
      "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
      "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
      "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
      "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]
    return random.choice(state)

def main(argv):
    tableNames = []
    columnNames = []

    tableNames.append("users")
    columnNames.append([["id","serial PRIMARY KEY"],["name","text NOT NULL UNIQUE"],
                       ["role","char(1) NOT NULL"],["age","integer NOT NULL"],
                       ["state","char(2) NOT NULL"]])
    userNum = int(argv[1])

    tableNames.append("categories")
    columnNames.append([["id","serial PRIMARY KEY"],["name","text NOT NULL UNIQUE"],
                       ["description","text NOT NULL"]])
    categoryNum = int(argv[2])

    tableNames.append("products")
    columnNames.append([["id","serial PRIMARY KEY"],["name","text NOT NULL"],
                       ["sku","char(10) NOT NULL UNIQUE"],["category_id","integer NOT NULL"],
                       ["price","float NOT NULL CHECK (price >= 0)"],["is_delete", "bool NOT NULL"]])
    productNum = int(argv[3])

    tableNames.append("orders")
    columnNames.append([["id","serial PRIMARY KEY"],["user_id","integer NOT NULL"],
                       ["product_id","integer NOT NULL"],["quantity","integer NOT NULL"],
                       ["price","float NOT NULL"],["is_cart","bool NOT NULL"]])
    saleNum = int(argv[4])

    fileNames = [tableName + '.txt' for tableName in tableNames]
    currPath = os.getcwd() + '/'

    pPriceList = []
    pPriceList.append(-1.0) #dummy
    def ColumnGenerate(i):
        seq = ''
        if i == 0:
            uNameUniqueList = []
            for a in range(userNum):
                uName = RanStringGen(10,string.ascii_letters,True,uNameUniqueList)
                uNameUniqueList.append(uName)
                seq += "%s,%s,%d,%s\n" % (uName,RanRoleGen(),RanIntegerGen(5,100),RanStateGen())
        elif i == 1:
            for a in range(categoryNum):
                seq += "%s,%s\n" % (RanStringGen(6),RanStringGen(50))
        elif i == 2:
            pSKUUniqueList = []
            for a in range(productNum):
                pSKU = RanStringGen(10,string.ascii_letters+string.digits,True,pSKUUniqueList)
                pSKUUniqueList.append(pSKU)
                pPrice = RanFloatGen(1,100)
                pPriceList.append(pPrice)
                seq += "%s,%s,%d,%.2f,%d\n" % (RanStringGen(10),pSKU,RanIntegerGen(1,categoryNum),pPrice,False)
        elif i == 3:
            for a in range(saleNum):
                uId = RanIntegerGen(1,userNum)
                pId = RanIntegerGen(1,productNum)
                sQul = RanIntegerGen(1,50)
                sPrice = sQul * pPriceList[pId]
                seq += "%d,%d,%d,%.2f,%d\n" % (uId,pId,sQul,sPrice,False)
        return seq

    for i in range(len(tableNames)):
        column = ''
        columnWithType = ''
        for j in range(len(columnNames[i])):
            columnWithType += "%s %s" % (columnNames[i][j][0], columnNames[i][j][1])
            if j+1 != len(columnNames[i]):
                columnWithType += ", "
            if j != 0: #except first column : id
                column += "%s" % columnNames[i][j][0]
                if j+1 != len(columnNames[i]):
                    column += ", "

        start = time.time()
        try:
            file = open(fileNames[i], 'w')
            seq = ColumnGenerate(i)
            file.write(seq);
            file.close()
        except:
            print('Something went wrong!')
            sys.exit(0)
        end = time.time()
        print "It took %.2f sec for creating %s files" % (end-start,tableNames[i])


if __name__ == "__main__":
    start = time.time()
    main(sys.argv)
    end = time.time()
    print "Totally, it took %.2f sec." % (end-start)
