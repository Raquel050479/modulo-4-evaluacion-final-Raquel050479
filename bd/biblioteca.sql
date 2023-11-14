CREATE DATABASE biblioteca;

use biblioteca;

CREATE TABLE
    libros (
        idLibro INT NOT NULL auto_increment primary key,
        titulo varchar(100) not null,
        autora varchar(100) not null,
        genero varchar(50) not null,
        fechaPublicacion date not null
    );

CREATE TABLE
    usuarias (
        idUsuaria INT NOT NULL auto_increment primary key,
        nombre varchar(30) not null,
        apellido varchar(50) not null,
        mail varchar(100) not null,
        telefono tinyint not null
    );

CREATE TABLE
    prestamos (
        idPrestamo INT auto_increment NOT NULL primary key,
        idLibro INT,
        idUsuaria INT,
        FOREIGN KEY (idLibro) references libros (idLibro),
        FOREIGN KEY (idUsuaria) references usuarias (idUsuaria)
    );

INSERT INTO
    libros (
        titulo,
        autora,
        genero,
        fechaPublicacion
    )
VALUES (
        'Todo va a mejorar',
        'Almudena Grandes',
        'novela literaria',
        '2022-10-11'
    ), (
        'La voz dormida',
        'Dulce Chacón',
        'novela histórica',
        '2002-08-20'
    ), (
        'La casa de los espíritus',
        'Isabel Allende',
        'realismo magico',
        '1982-01-01'
    ), (
        'Manolito Gafotas',
        'Elvira Lindo',
        'novela juvenil',
        '1994-05-05'
    );

INSERT INTO
    usuarias (
        nombre,
        apellido,
        mail,
        telefono
    )
VALUES (
        'Pepita',
        'Romero',
        'pepita@gmail.com',
        '333444'
    ), (
        'Julia',
        'Llanos',
        'julia@gmail.com',
        '666555'
    ), (
        'Luna',
        'Sanchez',
        'luna@gmail.com',
        '777222'
    ), (
        'Noelia',
        'Fuentes',
        'noelia@gmail.com',
        '444999'
    );

INSERT INTO
    prestamos (idLibro, idUsuaria)
VALUES (1, 3), (5, 4), (2, 5), (3, 6);

ALTER TABLE usuarias ADD COLUMN pass varchar(100) not null;