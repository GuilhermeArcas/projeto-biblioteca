import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Book from './Book';

interface LoanAttributes {
    id: number;
    user_id: number;
    book_id: number;
    loan_date: Date;
    return_date: Date | null; // nulo até que o livro seja devolvido
    status: 'active' | 'returned' | 'delayed';
}

interface LoanCreationAttributes extends Optional<LoanAttributes, 'id' | 'loan_date' | 'return_date' | 'status'> {}

class Loan extends Model<LoanAttributes, LoanCreationAttributes> implements LoanAttributes {
    declare id: number;
    declare user_id: number;
    declare book_id: number;
    declare loan_date: Date;
    declare return_date: Date;
    declare status: 'active' | 'returned' | 'delayed';
}

Loan.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' }, // chave estrangeira para Usuário
        },
        book_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'books', key: 'id' }, // chave estrangeira para Livro 
        },
        loan_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW, // Grava a data e hora atual do empréstimo
        },
        return_date: {
            type: DataTypes.DATE, 
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('active', 'returned', 'delayed' ),
            allowNull: false,
            defaultValue: 'active',
        },
    },
    {
        sequelize,
        modelName: 'Loan',
    }
);

    // Mapear os relacionamentos
    // Um empréstimo pertence a um Usuário e a um Livro
    Loan.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    Loan.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

    // As tabelas inversas também precisam se conhecer
    User.hasMany(Loan, { foreignKey: 'user_id', as: 'loans' });
    Book.hasMany(Loan, { foreignKey: 'book_id', as: 'loans' });

export default Loan;