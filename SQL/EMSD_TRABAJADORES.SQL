CREATE TABLE EMSD_TRABAJADORES(
	COD_TRABAJADOR NUMBER,
	NOMBRE_TRABAJADOR VARCHAR2(60),
	APELLIDO1_TRABAJADOR VARCHAR2(60),
	APELLIDO2_TRABAJADOR VARCHAR2(60),
	TELEFONO NUMBER,
	COD_ROL NUMBER,
	SUELDO NUMBER,
	EMAIL VARCHAR2(50),
	CONTRASENA VARCHAR2(60),
	CONSTRAINT PK_EMSD_TRABAJADORES PRIMARY KEY(COD_TRABAJADOR),
	CONSTRAINT FK_EMSD_TRABAJADORES_ROL_TRABAJADOR FOREIGN KEY(COD_ROL) REFERENCES EMSD_ROL_TRABAJADOR(COD_ROL)
);

CREATE OR REPLACE TRIGGER EMSD_TRABAJADORES
BEFORE INSERT
ON EMSD_TRABAJADORES
FOR EACH ROW
BEGIN
	SELECT MAX(COD_TRABAJADOR)+1 INTO :NEW.COD_TRABAJADOR
	FROM EMSD_TRABAJADORES;
	IF(:NEW.COD_TRABAJADOR IS NULL)THEN
		:NEW.COD_TRABAJADOR := 1;
	END IF;
END;

CREATE OR REPLACE FUNCTION EMSD_EMAIL_TRABAJADOR(
    NOMBRE_F VARCHAR2,
    APELLIDO1_F VARCHAR2
)
RETURN VARCHAR2
IS
    NICK VARCHAR2(50) := '';
    CORREO VARCHAR2(50) := '';
    CONT_NICK NUMBER := 0;
BEGIN
    NICK := SUBSTR(NOMBRE_F, 1, 2) || APELLIDO1_F;

    SELECT COUNT(*)
    INTO CONT_NICK
    FROM EMSD_TRABAJADORES
    WHERE REPLACE(EMAIL, '@SILCAR.CL', '') = NICK;

    IF (CONT_NICK = 0) THEN
        CORREO := NICK || '@SILCAR.CL';
    ELSE
        CORREO := NICK || TO_CHAR(CONT_NICK) || '@SILCAR.CL';
    END IF;

    RETURN CORREO;
END;


CREATE OR REPLACE PROCEDURE EMSD_TRABAJADORES_CRUD(
	P_OPCION VARCHAR2,
	P_COD_TRABAJADOR NUMBER,
	P_NOMBRE VARCHAR2,
	P_APELLIDO1 VARCHAR2,
	P_APELLIDO2 VARCHAR2,
	P_TELEFONO NUMBER,
	P_COD_ROL NUMBER,
	P_SUELDO NUMBER,
	P_EMAIL VARCHAR2,
	P_CONTRASENA VARCHAR2
)
IS 
BEGIN
	LOCK TABLE EMSD_TRABAJADORES IN ROW EXCLUSIVE MODE;
	IF(P_OPCION = 'INSERT') THEN
        INSERT INTO EMSD_TRABAJADORES(COD_TRABAJADOR, NOMBRE_TRABAJADOR, APELLIDO1_TRABAJADOR, APELLIDO2_TRABAJADOR, TELEFONO, COD_ROL, SUELDO, EMAIL, CONTRASENA)
        	VALUES(P_COD_TRABAJADOR, INITCAP(P_NOMBRE), INITCAP(P_APELLIDO1), INITCAP(P_APELLIDO2), P_TELEFONO, P_COD_ROL, P_SUELDO, LOWER(EMSD_EMAIL_TRABAJADOR(P_NOMBRE, P_APELLIDO1)), P_CONTRASENA);
    END IF;
    IF(P_OPCION = 'UPDATE') THEN
    	UPDATE EMSD_TRABAJADORES SET
            NOMBRE_TRABAJADOR = INITCAP(P_NOMBRE),
            APELLIDO1_TRABAJADOR = INITCAP(P_APELLIDO1),
            APELLIDO2_TRABAJADOR = INITCAP(P_APELLIDO2),
            TELEFONO = P_TELEFONO,
            COD_ROL = P_COD_ROL,
            SUELDO = P_SUELDO,
            EMAIL = LOWER(P_EMAIL),
            CONTRASENA = P_CONTRASENA
            WHERE COD_TRABAJADOR = P_COD_TRABAJADOR;
    END IF;
    IF(P_OPCION = 'DELETE') THEN
            DELETE FROM EMSD_TRABAJADORES WHERE COD_TRABAJADOR = P_COD_TRABAJADOR;    	
    END IF;
	COMMIT;
	EXCEPTION
		WHEN NO_DATA_FOUND THEN
    		RAISE_APPLICATION_ERROR(+100, 'No existe este cliente');
    	WHEN STORAGE_ERROR THEN
            RAISE_APPLICATION_ERROR(-6500, 'Fallo de memoria');
    ROLLBACK;
END;
