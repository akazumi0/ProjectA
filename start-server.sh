#!/bin/bash

# Script pour démarrer le serveur web local

echo "🚀 Démarrage du serveur Cosmic Catch..."
echo ""
echo "📱 Pour tester sur votre iPhone/iPad:"
echo ""
echo "1. Assurez-vous que votre ordinateur et votre iPhone sont sur le même WiFi"
echo ""
echo "2. Sur votre iPhone, ouvrez Safari et allez à l'une de ces adresses:"
echo ""

# Afficher toutes les adresses IP locales
if command -v ip &> /dev/null; then
    echo "   Adresses disponibles:"
    ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '127.0.0.1' | while read ip; do
        echo "   http://$ip:8000/cosmic-catch.html"
    done
elif command -v ifconfig &> /dev/null; then
    echo "   Adresses disponibles:"
    ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | while read ip; do
        echo "   http://$ip:8000/cosmic-catch.html"
    done
fi

echo ""
echo "3. Le jeu s'ouvrira dans Safari! 🎮"
echo ""
echo "Pour arrêter le serveur: Ctrl+C"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Démarrer le serveur Python
python3 -m http.server 8000
