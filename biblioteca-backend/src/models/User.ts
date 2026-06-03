import { DataType, DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import bcrypt from "bcryptjs";

// Atributos do usuário
interface UserAttributes {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    role: 'admin' | 'cliente' // o usuário só pode ser um dos dois
}

// Na hora de criar, o ID é opcional (o banco gera)
interface UserCreatianAttributes extends Optional<UserAttributes, 'id'>{}

class User extends Model<UserAttributes, UserCreatianAttributes> implements UserAttributes {
    declare id: number;
    declare name: string;
    declare email: string;
    declare password_hash: string;
    declare role: 'admin' | 'cliente';

    // Método para verificar se a senha digitado bate com a criptografada
    public checkPassword(password: string): boolean {
        return bcrypt.compareSync(password, this.password_hash);
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // Não permite e-mails duplicados
            validate: {
                isEmail: true, // O sequelize valida se é um e-mail real antes de salvar
            },
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('admin', 'cliente'),
            allowNull: false,
            defaultValue: 'cliente', // Por padrão, todo mundo é cliente primeiramente
        },
    },
    {
        sequelize,
        modelName: 'User',
        hooks: {
            // HOOKS são ações automáticas. Antes de salvar no banco, interceptamos a senha
            // Comum e tranformamos em um Hash seguro
            beforeSave: async (user) => {
                if (user.password_hash) {
                    const salt = bcrypt.genSaltSync(10);
                    user.password_hash = bcrypt.hashSync(user.password_hash, salt);
                }
            },
        },
    },

);

export default User