import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Développement seulement : autorise un téléphone du réseau local
   * (http://192.168.x.x:3000 ou http://<mac>.local:3000) à charger le
   * JavaScript du serveur de dev. Sans ça, Next 16 le bloque : la page
   * s'affiche mais rien n'est interactif (menu, tunnel, galerie).
   */
  allowedDevOrigins: ["192.168.*.*", "*.local"],
};

export default nextConfig;
