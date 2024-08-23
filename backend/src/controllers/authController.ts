import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db';
import { jwtSecret } from '../config';
import { validateEmail, validatePassword } from '../utils/validators';

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    if (!validatePassword(password)) {
      return res
        .status(400)
        .send({ message: 'Password invalid, it must be at least 8 characters' });
    }
    if (!validateEmail(email)) {
      return res.status(400).send({ message: 'Email invalid' });
    }

    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
      [email, hashedPassword]
    );
    console.log('register result', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const errStr = `${err}`;
    // todo this logic could be better tbh
    if (
      errStr.includes('duplicate key value violates unique constraint') &&
      errStr.includes('users_email_key')
    ) {
      return res.status(400).send({ message: 'User with this email already exists' });
    }
    res.status(500).send({ message: 'Server error: ' + err });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log('>>> login', req.body);

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    console.log('>>res', user);

    if (!user) {
      return res.status(400).send({ message: 'no user found for this email: ' + email });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).send({ message: 'password incorrect for user with email: ' + email });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, {
      expiresIn: '1h',
    });

    res.json({ token, user });
  } catch (err) {
    res.status(500).send({ message: 'Server error: ' + err });
  }
};
