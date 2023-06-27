## Pour démarrer

Il faut récupérer les données des talks la première fois.

```
export REAL_TALKS=$(curl -s 'https://www.breizhcamp.org/json/talks.json')
export OTHER_TALKS=$(curl -s 'https://www.breizhcamp.org/json/talks_others.json')
envsubst < public/components/App.js > replaced.js && cat replaced.js > public/components/App.js
```

Pour lancer l'appli, lancer simplement un serveur HTTP

```
npx live-server --host=0.0.0.0
```