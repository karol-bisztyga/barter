import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db';
import { jwtSecret } from '../config';
import { validateEmail, validatePassword } from '../utils/validators';
import { VERIFICATION_CODE_LENGTH } from '../constants';
import { sendVerificationEmail } from '../utils/mailingUtils';

const generateVerificationCode = () => {
  const characters = '1234567890';
  let code = '';

  for (let i = 0; i < VERIFICATION_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
};

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

    const verificationCode = generateVerificationCode();

    const result = await pool.query(
      'INSERT INTO users (email, password, verification_code) VALUES ($1, $2, $3) RETURNING *',
      [email, hashedPassword, verificationCode]
    );
    console.log(
      `register successful, sending email with verification code [${verificationCode}] to ${email}`
    );
    const emailResponse = await sendVerificationEmail(email, verificationCode);
    console.log('email sent', emailResponse);
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

const generateToken = (userId: string, userEmail: string) => {
  return jwt.sign({ id: userId, username: userEmail }, jwtSecret, {
    // expiresIn: '1h', // todo do a research about token expiration
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).send({ message: 'no user found for this email: ' + email });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).send({ message: 'password incorrect for user with email: ' + email });
    }

    const token = generateToken(user.id, user.email);

    res.json({ token, user });
  } catch (err) {
    res.status(500).send({ message: 'Server error: ' + err });
  }
};

export const verify = async (req: Request, res: Response) => {
  const { email, verificationCode } = req.body;
  console.log('>>> verify', email, verificationCode);

  try {
    const result = await pool.query(
      'UPDATE users SET verification_code = null WHERE email = $1 AND verification_code = $2 RETURNING *',
      [email, verificationCode]
    );
    const user = result.rows[0];
    console.log('>>res', user);

    if (user) {
      const token = generateToken(user.id, user.email);
      console.log('new token', token);
      res.json({ result: user, token });
    } else {
      return res.status(400).send({ message: 'verification failed' });
    }
  } catch (err) {
    res.status(500).send({ message: 'Server error: ' + err });
  }
};
