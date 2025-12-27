# ImmoGest - Backend Django

Backend API REST pour l'application de gestion immobilière ImmoGest.

## 🚀 Installation rapide

### Prérequis

- Python 3.10+
- PostgreSQL 14+
- pip (gestionnaire de paquets Python)

### Étapes d'installation

#### 1. Installer PostgreSQL

**macOS (avec Homebrew) :**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian :**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows :**
Téléchargez l'installateur depuis https://www.postgresql.org/download/windows/

#### 2. Créer la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE immogest_db;

# Créer un utilisateur (optionnel, vous pouvez utiliser postgres)
CREATE USER immogest_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE immogest_db TO immogest_user;

# Quitter
\q
```

#### 3. Installer le backend Django

```bash
# Naviguer vers le dossier backend
cd backend-django

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# macOS/Linux :
source venv/bin/activate
# Windows :
venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt
```

#### 4. Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env avec vos paramètres
# Notamment : DB_PASSWORD, DJANGO_SECRET_KEY
```

#### 5. Initialiser la base de données

```bash
# Appliquer les migrations
python manage.py makemigrations
python manage.py migrate

# Créer un superutilisateur (admin)
python manage.py createsuperuser
```

#### 6. Lancer le serveur

```bash
python manage.py runserver
```

Le backend sera accessible sur : http://localhost:8000

## 📚 Documentation API

Une fois le serveur lancé, accédez à :
- **Swagger UI** : http://localhost:8000/api/docs/
- **Schema OpenAPI** : http://localhost:8000/api/schema/

## 🔑 Endpoints principaux

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/accounts/login/` | Connexion (retourne JWT) |
| POST | `/api/accounts/refresh/` | Rafraîchir le token |
| GET | `/api/accounts/profile/` | Profil utilisateur |

### Biens immobiliers
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/properties/` | Liste des biens |
| POST | `/api/properties/create/` | Créer un bien |
| GET | `/api/properties/{id}/` | Détails d'un bien |
| GET | `/api/properties/stats/` | Statistiques |

### Locataires
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/tenants/` | Liste des locataires |
| POST | `/api/accounts/tenants/create/` | Créer un locataire |
| POST | `/api/tenants/assignments/create/` | Assigner un locataire |
| GET | `/api/tenants/my-property/` | Mon logement (locataire) |

### Paiements
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/payments/` | Liste des paiements |
| POST | `/api/payments/generate-monthly/` | Générer échéances |
| POST | `/api/payments/{id}/record/` | Enregistrer paiement |
| GET | `/api/payments/my-payments/` | Mes paiements (locataire) |

## 🔐 Rôles utilisateur

| Rôle | Description | Permissions |
|------|-------------|-------------|
| `admin` | Administrateur | Tout |
| `agent` | Agent immobilier | Gérer ses biens, locataires, paiements |
| `tenant` | Locataire | Voir son logement, payer son loyer |

## 🧪 Données de test

Pour créer des données de test :

```bash
python manage.py shell

# Dans le shell Python :
from apps.accounts.models import User

# Créer un agent
agent = User.objects.create_user(
    email='agent@test.com',
    password='agent123',
    first_name='Marie',
    last_name='Dupont',
    role='agent'
)

# Créer un locataire
tenant = User.objects.create_user(
    email='locataire@test.com',
    password='tenant123',
    first_name='Pierre',
    last_name='Martin',
    role='tenant'
)
```

## 🔄 Lancer Frontend + Backend ensemble

### Terminal 1 - Backend (Django)
```bash
cd backend-django
source venv/bin/activate  # ou venv\Scripts\activate sur Windows
python manage.py runserver
```

### Terminal 2 - Frontend (React/Vite)
```bash
# À la racine du projet
npm run dev
```

Le frontend sera sur http://localhost:5173 et appellera le backend sur http://localhost:8000.

## 📁 Structure du projet

```
backend-django/
├── immogest/               # Configuration principale Django
│   ├── settings.py         # Paramètres de l'application
│   ├── urls.py             # Routes principales
│   └── wsgi.py             # Point d'entrée WSGI
├── apps/
│   ├── accounts/           # Gestion des utilisateurs
│   │   ├── models.py       # Modèle User personnalisé
│   │   ├── serializers.py  # Sérialiseurs DRF
│   │   ├── views.py        # Vues API
│   │   └── permissions.py  # Permissions personnalisées
│   ├── properties/         # Gestion des biens
│   ├── tenants/            # Gestion des locataires
│   └── payments/           # Gestion des paiements
├── requirements.txt        # Dépendances Python
├── manage.py               # Script de gestion Django
└── .env.example            # Exemple de configuration
```

## ⚠️ Notes importantes

1. **Sécurité** : En production, changez `DJANGO_SECRET_KEY` et désactivez `DEBUG`
2. **CORS** : Les origines autorisées sont configurées pour le développement local
3. **JWT** : Les tokens expirent après 1 heure (configurable dans settings.py)
