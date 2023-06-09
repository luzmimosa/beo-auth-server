import express from "express";
import mongoose, {Document, Model, Schema} from 'mongoose';

const dbAddress = 'mongodb://auth.beo.fadedbytes.com/beodb';
//const dbAddress = 'mongodb://127.0.0.1:27017/beodb';
const serverPort = 9987;

const server = express();
server.get('/:clave', async (req, res) => {
    const clave = req.params.clave;

    const esValida = await comprobarClave(clave);

    // Devolver el código de respuesta adecuado
    if (esValida) {
        res.sendStatus(200); // Clave válida, código 200 OK
    } else {
        res.sendStatus(403); // Clave inválida, código 403 Forbidden
    }
});

async function comprobarClave(clave: string): Promise<boolean> {
    console.log('Comprobando clave:', clave)
    const licencia = await obtenerLicenciaPorValor(clave)

    console.log('Licencia:', licencia)

    if (!licencia) {
        return false;
    }

    const ahora = Date.now();
    const caducidad = licencia.caducidad;

    console.log("Ahora    : ", ahora)
    console.log("Caducidad: ", caducidad)
    console.log("Licencia valida: ", ahora <= caducidad)

    return ahora <= caducidad;
}


////////////////////////////////////////////////////////////////////

mongoose.connect(dbAddress).then(() => console.log('Conectado a la base de datos'));

interface ILicencia extends Document {
    value: string;
    clienteID: string;
    caducidad: number;
}

const licenciaSchema: Schema<ILicencia> = new mongoose.Schema({
    value: String,
    clienteID: String,
    caducidad: Number,
});

// Crear el modelo basado en el esquema
const Licencia: Model<ILicencia> = mongoose.model('Licencia', licenciaSchema);

// Método para obtener un objeto de licencia por el valor (value)
async function obtenerLicenciaPorValor(value: string): Promise<ILicencia | null> {
    try {
        return await Licencia.findOne({value});
    } catch (error) {
        console.error('Error al obtener la licencia:', error);
        return null;
    }
}

////////////////////////////////////////////////////////////////////

server.listen(serverPort, () => {
    console.log('Servidor escuchando en el puerto ' + serverPort);
});

console.log(Date.now())