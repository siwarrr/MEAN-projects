const User = require('../models/user'); // Assurez-vous que le chemin vers votre modèle User est correct
const bcrypt = require('bcryptjs'); // Pour le hachage des mots de passe
const jwt = require('jsonwebtoken');

// API pour s'inscrire en tant qu'Instructeur
exports.registerInstructor = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer un nouvel utilisateur avec le rôle "instructor"
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'Instructor'
        });

        // Sauvegarder le nouvel utilisateur
        await newUser.save();

        // Générer un token et répondre au client
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRE_TIME,
        });

        res.status(201).json({ message: 'Instructor registered successfully.', user: newUser, token });
    } catch (error) {
        console.error('Error during instructor registration:', error); // Affiche l'erreur complète
        res.status(500).json({ message: 'Server error during instructor registration.' });
    }
};

// API pour s'inscrire en tant qu'Étudiant
exports.registerStudent = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer un nouvel utilisateur avec le rôle "student"
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'Student'
        });

        // Sauvegarder le nouvel utilisateur
        await newUser.save();

        // Générer un token et répondre au client
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRE_TIME,
        });

        res.status(201).json({ message: 'Student registered successfully.', user: newUser, token });
    } catch (error) {
        console.error('Error during instructor registration:', error); // Affiche l'erreur complète
        res.status(500).json({ message: 'Server error during instructor registration.' });
    }
};

// API pour se connecter
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Rechercher l'utilisateur dans la base de données
      const user = await User.findOne({ email });
  
      // Vérifier si l'utilisateur existe
      if (!user) {
        console.error('User not found with email:', email);
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      // Vérifier si le mot de passe est correct
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.error('Password incorrect for user:', email);
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      // Créer un token JWT avec l'ID de l'utilisateur et son rôle
      const token = jwt.sign({ userId: user._id, fullName: user.username, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
  
      // Envoyer le token et le rôle de l'utilisateur dans la réponse
      console.log('Login successful for user:', email);
      res.status(200).json({ token, role: user.role });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Server Error' });
    }
};

// API pour extraire le nom complet d'utilisateur connecté
exports.getUserName = async (req, res) => {
    try{
        const userId = req.user.userId;

        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({ message: 'User not found'});
        }

        return res.status(200).json({ username: user.username});
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error'});
    }
};

//Api pour récupérer les informations de l'utilisateur actuel.
exports.getCurrentUser = async (req, res) => {
    try {
        // Récupérer l'ID de l'utilisateur à partir de req.user.userId (le middleware ajoute l'utilisateur à req.user)
        const userId = req.user.userId;

        // Rechercher l'utilisateur dans la base de données
        const user = await User.findById(userId);

        // Vérifier si l'utilisateur existe
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Renvoyer les informations de l'utilisateur
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
