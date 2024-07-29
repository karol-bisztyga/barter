import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db";
import { User } from "../models/User";
import { jwtSecret } from "../config";

export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser: User = { username, password: hashedPassword };

  try {
    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
      [newUser.username, newUser.password]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).send("Invalid username or password");
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).send("Invalid username or password");
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      jwtSecret,
      {
        expiresIn: "1h",
      }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).send("Server error");
  }
};
