const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');
const { generarJWT } = require('../helpers/jwt');

const crearUsuario = async (req, res = response) => {

    const { email , password } = req.body;

    try {

        const existeEmail = await Usuario.findOne({email});

        if( existeEmail){
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya está registrado'
            })
        }

        const usuario = new Usuario( req.body );
        
        //Encriptar contraseña
        //1. Obtenemos el salt numero aleatorio creo para codificar
        //2. encriptamos la contraseña
        const salt = bcrypt.genSaltSync();

        usuario.password = bcrypt.hashSync(password, salt);
        
        await usuario.save();

        //Generar token
        const token = await generarJWT(usuario.id);
    
        res.json({
            ok: true,
            usuario,
            token

        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }   
    
}

const login = async (req, res = response) =>{

    const {email, password} = req.body;

    try {
        const usuarioDB = await Usuario.findOne({email});
        if( !usuarioDB ){
            return res.status(404).json({
                ok: false,
                msg: 'Email no encontrado'
            });
        }

        //validar el password

    const validPassword = bcrypt.compareSync( password, usuarioDB.password);
    if(!validPassword ){
        return res.status(400).json({
            ok: false,
            msg: 'La contraseña no es valida'
        });
    }

    //Generar JWT
    const token = await generarJWT( usuarioDB.id);
    res.json({
        ok: true,
        usuario: usuarioDB,
        token

    });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

const renewToken = async ( req, res= response ) => {

    
    try {

        // Leer id. const uid
    const uid = req.uid;

    //generar nuevo JWT... generarJWT
    const token = await generarJWT(uid);

    //Obtener el usuario por el uid. Usuario.findById
    const usuarioDB = await Usuario.findById(uid);

    if( !usuarioDB ){
        return res.status(404).json({
            ok: false,
            msg: 'uid no encontrado'
        });
    }
        
        res.json({
            ok:true,
            usuarioDB,
            token
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }

    
}

module.exports = {
    crearUsuario,
    login,
    renewToken
}