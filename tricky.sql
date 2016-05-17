select products.name, products.id, users.id, users.name, orders.user_id, orders.product_id, orders.quantity, orders.price, 
CASE WHEN products.id = orders.product_id THEN orders.quantity * orders.price ELSE 0 END as cells 
FROM products, orders, users 
WHERE orders.user_id = users.id 
ORDER BY users.name, products.name;



 name    | id  | id  |    name    | user_id | product_id | quantity |  price  |   cells   
------------+-----+-----+------------+---------+------------+----------+---------+-----------
 02vmm2mrtE |  96 |  58 | ACtonzkWAk |      58 |          5 |       12 |  1055.7 |         0
 02vmm2mrtE |  96 |  58 | ACtonzkWAk |      58 |         60 |       33 |   618.9 |         0
 02vmm2mrtE |  96 |  58 | ACtonzkWAk |      58 |         88 |       33 | 2494.27 |         0
 02vmm2mrtE |  96 |  58 | ACtonzkWAk |      58 |         28 |       48 | 1952.48 |         0
 02vmm2mrtE |  96 |  58 | ACtonzkWAk |      58 |         31 |        7 |  462.85 |         0
 02vmm2mrtE |  96 |  58 | ACtonzkWAk |      58 |         95 |       48 | 1479.72 |         0
 02vmm2mrtE |  96 |  58 | ACtonzkWAk |      58 |         12 |       46 |  2301.5 |         0
 02vmm2mrtE |  96 |  58 | ACtonzkWAk |      58 |         39 |        4 |  199.21 |         0
 02vmm2mrtE |  96 |  58 | ACtonzkWAk |      58 |         82 |       29 | 1303.65 |         0
 02vmm2mrtE |  96 |  58 | ACtonzkWAk |      58 |         65 |       15 |  213.53 |         0
 02vmm2mrtE |  96 |  58 | ACtonzkWAk |      58 |         52 |       46 | 4397.42 |         0
 02vmm2mrtE |  96 |  58 | ACtonzkWAk |      58 |         34 |       30 |  501.49 |         0
 02vmm2mrtE |  96 |  58 | ACtonzkWAk |      58 |         89 |        3 |   14.82 |         0
 0YC4x81pYh |  57 |  58 | ACtonzkWAk |      58 |         52 |       46 | 4397.42 |         0
 0YC4x81pYh |  57 |  58 | ACtonzkWAk |      58 |         89 |        3 |   14.82 |         0
 0YC4x81pYh |  57 |  58 | ACtonzkWAk |      58 |          5 |       12 |  1055.7 |         0
 0YC4x81pYh |  57 |  58 | ACtonzkWAk |      58 |         12 |       46 |  2301.5 |         0
 0YC4x81pYh |  57 |  58 | ACtonzkWAk |      58 |         60 |       33 |   618.9 |         0
 0YC4x81pYh |  57 |  58 | ACtonzkWAk |      58 |         95 |       48 | 1479.72 |         0
 0YC4x81pYh |  57 |  58 | ACtonzkWAk |      58 |         28 |       48 | 1952.48 |         0
 0YC4x81pYh |  57 |  58 | ACtonzkWAk |      58 |         31 |        7 |  462.85 |         0
 0YC4x81pYh |  57 |  58 | ACtonzkWAk |      58 |         39 |        4 |  199.21 |         0
 0YC4x81pYh |  57 |  58 | ACtonzkWAk |      58 |         65 |       15 |  213.53 |         0
 0YC4x81pYh |  57 |  58 | ACtonzkWAk |      58 |         88 |       33 | 2494.27 |         0
 0YC4x81pYh |  57 |  58 | ACtonzkWAk |      58 |         34 |       30 |  501.49 |         0
 0YC4x81pYh |  57 |  58 | ACtonzkWAk |      58 |         82 |       29 | 1303.65 |         0
 0YH70lcQxU |  73 |  58 | ACtonzkWAk |      58 |         31 |        7 |  462.85 |         0
 0YH70lcQxU |  73 |  58 | ACtonzkWAk |      58 |         60 |       33 |   618.9 |         0
 0YH70lcQxU |  73 |  58 | ACtonzkWAk |      58 |         65 |       15 |  213.53 |         0
 0YH70lcQxU |  73 |  58 | ACtonzkWAk |      58 |         28 |       48 | 1952.48 |         0
 0YH70lcQxU |  73 |  58 | ACtonzkWAk |      58 |         88 |       33 | 2494.27 |         0
 0YH70lcQxU |  73 |  58 | ACtonzkWAk |      58 |         82 |       29 | 1303.65 |         0
 0YH70lcQxU |  73 |  58 | ACtonzkWAk |      58 |         89 |        3 |   14.82 |         0
 0YH70lcQxU |  73 |  58 | ACtonzkWAk |      58 |         95 |       48 | 1479.72 |         0
 0YH70lcQxU |  73 |  58 | ACtonzkWAk |      58 |          5 |       12 |  1055.7 |         0
 0YH70lcQxU |  73 |  58 | ACtonzkWAk |      58 |         39 |        4 |  199.21 |         0
 0YH70lcQxU |  73 |  58 | ACtonzkWAk |      58 |         12 |       46 |  2301.5 |         0
 0YH70lcQxU |  73 |  58 | ACtonzkWAk |      58 |         52 |       46 | 4397.42 |         0
 0YH70lcQxU |  73 |  58 | ACtonzkWAk |      58 |         34 |       30 |  501.49 |         0
 1oKUJPDYmn |  95 |  58 | ACtonzkWAk |      58 |         31 |        7 |  462.85 |         0
 1oKUJPDYmn |  95 |  58 | ACtonzkWAk |      58 |         88 |       33 | 2494.27 |         0
 1oKUJPDYmn |  95 |  58 | ACtonzkWAk |      58 |         65 |       15 |  213.53 |         0
 1oKUJPDYmn |  95 |  58 | ACtonzkWAk |      58 |         95 |       48 | 1479.72 |  71026.56


 SW6XR02nLF


  name    |    name    |    sum    
------------+------------+-----------
 zXtCJDHxSD | hZPb6FSFQp |  12114.18
 APJtJAyHhl | wLOetEEl8G | 118148.16
 jjGuiJjIAX | wLOetEEl8G |  22449.01
 HwKLgzwrBE | WEznItvk3v |    3909.5
 OcrlGJcpQl | HOXDEsrbSz |  35449.89
 noKVeTBEPm | QtJYxRkoN2 |  27782.56
 CxvIphGpzH | K8uEEptcoT | 211227.73
 ZuqLDWGjzH | QqLPMO5NPx | 140366.37
 sLVcOBFRiK | iKhWxUm9tb |  25589.31
 dIzlXUXrif | sOuLkyvdsf |    4908.4
 wRkzsqJgrh | 0YC4x81pYh |   87245.2
 kJHenerWhZ | GaF7OTNC0w |   5420.11
 IPMaLpGEJc | 4OhFfKzXUV |   15461.6
 EqTCfcvXqn | bjabgh9JP6 |   82347.2
 QKLniOsndT | ph5yyrVRxz |   1209.36
 IPMaLpGEJc | bjabgh9JP6 | 127280.16

 user | product |   total   
------+---------+-----------
   76 |      22 |   19965.5
   93 |      20 |   60200.4
   74 |      21 |  14652.04
   32 |      64 |   25847.3
   38 |      29 |   77254.4
   60 |      19 |  122169.6
   79 |      70 | 102655.44
   34 |      27 |  25589.31
   26 |      99 |  98958.72
    3 |      78 |    3909.5
   18 |      27 |  20568.86
   38 |      71 |  68679.36
   70 |      65 |   3644.16
   97 |      53 |   7832.37

	1 |      62 |   6318.78
    1 |      97 |   7991.02
    1 |      15 | 172333.94
    1 |      95 |   77068.5
    1 |      30 |   9673.34
    1 |      61 |  150378.5
    1 |      48 |   4549.23
    1 |       9 |  17912.22
    1 |      82 |  46032.32
    1 |      13 |   2557.28
    1 |      68 |  131454.5
    1 |      74 |  10343.77

select orders.user_id as user, products.id as product, SUM(CASE WHEN products.id = orders.product_id THEN orders.price ELSE 0 END) as total 
FROM orders, products 
WHERE orders.user_id = 1 
GROUP BY products.id, orders.user_id 
ORDER by products.id ASC;

   1 |       1 |       0
   1 |       2 |       0
   1 |       3 |       0
   1 |       4 |       0
   1 |       5 |       0
   1 |       6 |       0
   1 |       7 |       0
   1 |       8 |       0
   1 |       9 |  526.83
   1 |      10 |       0
   1 |      11 |       0
   1 |      12 |       0
   1 |      13 |  232.48
   1 |      14 |       0
   1 |      15 | 3746.39
   1 |      16 |       0
   1 |      17 |       0
   1 |      18 |       0
   1 |      19 |       0
   1 |      20 |       0
   1 |      21 |       0
   1 |      22 |       0
   1 |      23 |       0
   1 |      24 |       0
   1 |      25 |       0
   1 |      26 |       0
   1 |      27 |       0
   1 |      28 |       0
