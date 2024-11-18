COMANDO IMPORTANTES:

Mediante consola, preferentemente no el powershell puede ser por gitbash o cualquier otro terminal
te vas a la ruta de esta carpeta (backend) y pones el siguiente comando:

(recuerden tener instalado el node.js o sino estan puro leseando)

npm init -y

este les creara un json con los parametrodes de la carpeta y etc es para inicialiazar todito
Despues hay que instalar las dependencias necesarias para que el backend funcione bien con nuestra base de datos como tal
considerando que usamos oracle database 21c (instalado con el oracle database xe), hay que ejecutar la siguiente linea:

npm install express oracledb body-parser cors
