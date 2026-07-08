// Fichier de données — Flux d'acquisition Digital Virgo
const kmsData = {
  "services": [
    {
      "id": "busuu-sn",
      "title": "Busuu SN",
      "vertical": "CONTENT",
      "operator": "Orange Senegal",
      "format": "PARCOURS_CLIENT",
      "description": "Cartographie complète du parcours utilisateur pour le service Busuu SN.",
      "flows": {
        "wifi": {
          "id": "flow-wifi-busuu-sn",
          "label": "Wi-Fi — PIN Code (5 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "L'utilisateur arrive sur la Landing Page depuis un réseau Wi-Fi."
            },
            {
              "title": "Saisie du téléphone",
              "description": "L'utilisateur renseigne son numéro de téléphone mobile."
            },
            {
              "title": "Réception du PIN",
              "description": "Un code PIN à usage unique (OTP) est envoyé par SMS."
            },
            {
              "title": "Saisie du code PIN",
              "description": "L'utilisateur retourne sur la LP et saisit le code PIN."
            },
            {
              "title": "Accès à l'application",
              "description": "Authentification validée, accès à l'app."
            }
          ]
        },
        "g4": {
          "id": "flow-4g-busuu-sn",
          "label": "4G / HE 2 Clics — DCB (4 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "Arrivée sur la LP depuis un réseau 4G (Header Enrichment)."
            },
            {
              "title": "Clic sur 'Souscrire'",
              "description": "Clic sur le bouton Souscrire."
            },
            {
              "title": "Confirmation",
              "description": "Confirmation de l'abonnement (DCB)."
            },
            {
              "title": "Accès à l'application",
              "description": "Transaction approuvée, accès immédiat."
            }
          ]
        }
      }
    },
    {
      "id": "busuu-wallet-sn",
      "title": "Busuu Wallet SN",
      "vertical": "CONTENT",
      "operator": "Orange Senegal",
      "format": "PARCOURS_CLIENT",
      "description": "Cartographie complète du parcours utilisateur pour le service Busuu Wallet SN.",
      "flows": {
        "wifi": {
          "id": "flow-wifi-busuu-wallet-sn",
          "label": "Wi-Fi — PIN Code (5 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "L'utilisateur arrive sur la Landing Page depuis un réseau Wi-Fi."
            },
            {
              "title": "Saisie du téléphone",
              "description": "L'utilisateur renseigne son numéro de téléphone mobile."
            },
            {
              "title": "Réception du PIN",
              "description": "Un code PIN à usage unique (OTP) est envoyé par SMS."
            },
            {
              "title": "Saisie du code PIN",
              "description": "L'utilisateur retourne sur la LP et saisit le code PIN."
            },
            {
              "title": "Accès à l'application",
              "description": "Authentification validée, accès à l'app."
            }
          ]
        },
        "g4": {
          "id": "flow-4g-busuu-wallet-sn",
          "label": "4G / HE 2 Clics — DCB (4 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "Arrivée sur la LP depuis un réseau 4G (Header Enrichment)."
            },
            {
              "title": "Clic sur 'Souscrire'",
              "description": "Clic sur le bouton Souscrire."
            },
            {
              "title": "Confirmation",
              "description": "Confirmation de l'abonnement (DCB)."
            },
            {
              "title": "Accès à l'application",
              "description": "Transaction approuvée, accès immédiat."
            }
          ]
        }
      }
    },
    {
      "id": "clicnscores",
      "title": "ClicNscores",
      "vertical": "CONTENT",
      "operator": "Orange Senegal",
      "format": "PARCOURS_CLIENT",
      "description": "Cartographie complète du parcours utilisateur pour le service ClicNscores.",
      "flows": {
        "wifi": {
          "id": "flow-wifi-clicnscores",
          "label": "Wi-Fi — PIN Code (5 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "L'utilisateur arrive sur la Landing Page depuis un réseau Wi-Fi."
            },
            {
              "title": "Saisie du téléphone",
              "description": "L'utilisateur renseigne son numéro de téléphone mobile."
            },
            {
              "title": "Réception du PIN",
              "description": "Un code PIN à usage unique (OTP) est envoyé par SMS."
            },
            {
              "title": "Saisie du code PIN",
              "description": "L'utilisateur retourne sur la LP et saisit le code PIN."
            },
            {
              "title": "Accès à l'application",
              "description": "Authentification validée, accès à l'app."
            }
          ]
        },
        "g4": {
          "id": "flow-4g-clicnscores",
          "label": "4G / HE 2 Clics — DCB (4 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "Arrivée sur la LP depuis un réseau 4G (Header Enrichment)."
            },
            {
              "title": "Clic sur 'Souscrire'",
              "description": "Clic sur le bouton Souscrire."
            },
            {
              "title": "Confirmation",
              "description": "Confirmation de l'abonnement (DCB)."
            },
            {
              "title": "Accès à l'application",
              "description": "Transaction approuvée, accès immédiat."
            }
          ]
        }
      }
    },
    {
      "id": "focus-pro",
      "title": "FOCUS PRO",
      "vertical": "CONTENT",
      "operator": "Orange Senegal",
      "format": "PARCOURS_CLIENT",
      "description": "Cartographie complète du parcours utilisateur pour le service FOCUS PRO.",
      "flows": {
        "wifi": {
          "id": "flow-wifi-focus-pro",
          "label": "Wi-Fi — PIN Code (5 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "L'utilisateur arrive sur la Landing Page depuis un réseau Wi-Fi."
            },
            {
              "title": "Saisie du téléphone",
              "description": "L'utilisateur renseigne son numéro de téléphone mobile."
            },
            {
              "title": "Réception du PIN",
              "description": "Un code PIN à usage unique (OTP) est envoyé par SMS."
            },
            {
              "title": "Saisie du code PIN",
              "description": "L'utilisateur retourne sur la LP et saisit le code PIN."
            },
            {
              "title": "Accès à l'application",
              "description": "Authentification validée, accès à l'app."
            }
          ]
        },
        "g4": {
          "id": "flow-4g-focus-pro",
          "label": "4G / HE 2 Clics — DCB (4 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "Arrivée sur la LP depuis un réseau 4G (Header Enrichment)."
            },
            {
              "title": "Clic sur 'Souscrire'",
              "description": "Clic sur le bouton Souscrire."
            },
            {
              "title": "Confirmation",
              "description": "Confirmation de l'abonnement (DCB)."
            },
            {
              "title": "Accès à l'application",
              "description": "Transaction approuvée, accès immédiat."
            }
          ]
        }
      }
    },
    {
      "id": "game-arena-sn",
      "title": "Game Arena SN",
      "vertical": "CONTENT",
      "operator": "Orange Senegal",
      "format": "PARCOURS_CLIENT",
      "description": "Cartographie complète du parcours utilisateur pour le service Game Arena SN.",
      "flows": {
        "wifi": {
          "id": "flow-wifi-game-arena-sn",
          "label": "Wi-Fi — PIN Code (5 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "L'utilisateur arrive sur la Landing Page depuis un réseau Wi-Fi."
            },
            {
              "title": "Saisie du téléphone",
              "description": "L'utilisateur renseigne son numéro de téléphone mobile."
            },
            {
              "title": "Réception du PIN",
              "description": "Un code PIN à usage unique (OTP) est envoyé par SMS."
            },
            {
              "title": "Saisie du code PIN",
              "description": "L'utilisateur retourne sur la LP et saisit le code PIN."
            },
            {
              "title": "Accès à l'application",
              "description": "Authentification validée, accès à l'app."
            }
          ]
        },
        "g4": {
          "id": "flow-4g-game-arena-sn",
          "label": "4G / HE 2 Clics — DCB (4 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "Arrivée sur la LP depuis un réseau 4G (Header Enrichment)."
            },
            {
              "title": "Clic sur 'Souscrire'",
              "description": "Clic sur le bouton Souscrire."
            },
            {
              "title": "Confirmation",
              "description": "Confirmation de l'abonnement (DCB)."
            },
            {
              "title": "Accès à l'application",
              "description": "Transaction approuvée, accès immédiat."
            }
          ]
        }
      }
    },
    {
      "id": "kidjo-sn",
      "title": "KIDJO SN",
      "vertical": "CONTENT",
      "operator": "Orange Senegal",
      "format": "PARCOURS_CLIENT",
      "description": "Cartographie complète du parcours utilisateur pour le service KIDJO SN.",
      "flows": {
        "wifi": {
          "id": "flow-wifi-kidjo-sn",
          "label": "Wi-Fi — PIN Code (5 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "L'utilisateur arrive sur la Landing Page depuis un réseau Wi-Fi."
            },
            {
              "title": "Saisie du téléphone",
              "description": "L'utilisateur renseigne son numéro de téléphone mobile."
            },
            {
              "title": "Réception du PIN",
              "description": "Un code PIN à usage unique (OTP) est envoyé par SMS."
            },
            {
              "title": "Saisie du code PIN",
              "description": "L'utilisateur retourne sur la LP et saisit le code PIN."
            },
            {
              "title": "Accès à l'application",
              "description": "Authentification validée, accès à l'app."
            }
          ]
        },
        "g4": {
          "id": "flow-4g-kidjo-sn",
          "label": "4G / HE 2 Clics — DCB (4 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "Arrivée sur la LP depuis un réseau 4G (Header Enrichment)."
            },
            {
              "title": "Clic sur 'Souscrire'",
              "description": "Clic sur le bouton Souscrire."
            },
            {
              "title": "Confirmation",
              "description": "Confirmation de l'abonnement (DCB)."
            },
            {
              "title": "Accès à l'application",
              "description": "Transaction approuvée, accès immédiat."
            }
          ]
        }
      }
    },
    {
      "id": "maternelle-montessori",
      "title": "Maternelle Montessori",
      "vertical": "CONTENT",
      "operator": "Orange Senegal",
      "format": "PARCOURS_CLIENT",
      "description": "Cartographie complète du parcours utilisateur pour le service Maternelle Montessori.",
      "flows": {
        "wifi": {
          "id": "flow-wifi-maternelle-montessori",
          "label": "Wi-Fi — PIN Code (5 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "L'utilisateur arrive sur la Landing Page depuis un réseau Wi-Fi."
            },
            {
              "title": "Saisie du téléphone",
              "description": "L'utilisateur renseigne son numéro de téléphone mobile."
            },
            {
              "title": "Réception du PIN",
              "description": "Un code PIN à usage unique (OTP) est envoyé par SMS."
            },
            {
              "title": "Saisie du code PIN",
              "description": "L'utilisateur retourne sur la LP et saisit le code PIN."
            },
            {
              "title": "Accès à l'application",
              "description": "Authentification validée, accès à l'app."
            }
          ]
        },
        "g4": {
          "id": "flow-4g-maternelle-montessori",
          "label": "4G / HE 2 Clics — DCB (4 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "Arrivée sur la LP depuis un réseau 4G (Header Enrichment)."
            },
            {
              "title": "Clic sur 'Souscrire'",
              "description": "Clic sur le bouton Souscrire."
            },
            {
              "title": "Confirmation",
              "description": "Confirmation de l'abonnement (DCB)."
            },
            {
              "title": "Accès à l'application",
              "description": "Transaction approuvée, accès immédiat."
            }
          ]
        }
      }
    },
    {
      "id": "playup-sn",
      "title": "Playup SN",
      "vertical": "CONTENT",
      "operator": "Orange Senegal",
      "format": "PARCOURS_CLIENT",
      "description": "Cartographie complète du parcours utilisateur pour le service Playup SN.",
      "flows": {
        "wifi": {
          "id": "flow-wifi-playup-sn",
          "label": "Wi-Fi — PIN Code (5 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "L'utilisateur arrive sur la Landing Page depuis un réseau Wi-Fi."
            },
            {
              "title": "Saisie du téléphone",
              "description": "L'utilisateur renseigne son numéro de téléphone mobile."
            },
            {
              "title": "Réception du PIN",
              "description": "Un code PIN à usage unique (OTP) est envoyé par SMS."
            },
            {
              "title": "Saisie du code PIN",
              "description": "L'utilisateur retourne sur la LP et saisit le code PIN."
            },
            {
              "title": "Accès à l'application",
              "description": "Authentification validée, accès à l'app."
            }
          ]
        },
        "g4": {
          "id": "flow-4g-playup-sn",
          "label": "4G / HE 2 Clics — DCB (4 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "Arrivée sur la LP depuis un réseau 4G (Header Enrichment)."
            },
            {
              "title": "Clic sur 'Souscrire'",
              "description": "Clic sur le bouton Souscrire."
            },
            {
              "title": "Confirmation",
              "description": "Confirmation de l'abonnement (DCB)."
            },
            {
              "title": "Accès à l'application",
              "description": "Transaction approuvée, accès immédiat."
            }
          ]
        }
      }
    },
    {
      "id": "playvod",
      "title": "PlayVOD",
      "vertical": "CONTENT",
      "operator": "Orange Senegal",
      "format": "PARCOURS_CLIENT",
      "description": "Cartographie complète du parcours utilisateur pour le service PlayVOD.",
      "flows": {
        "wifi": {
          "id": "flow-wifi-playvod",
          "label": "Wi-Fi — PIN Code (5 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "L'utilisateur arrive sur la Landing Page depuis un réseau Wi-Fi."
            },
            {
              "title": "Saisie du téléphone",
              "description": "L'utilisateur renseigne son numéro de téléphone mobile."
            },
            {
              "title": "Réception du PIN",
              "description": "Un code PIN à usage unique (OTP) est envoyé par SMS."
            },
            {
              "title": "Saisie du code PIN",
              "description": "L'utilisateur retourne sur la LP et saisit le code PIN."
            },
            {
              "title": "Accès à l'application",
              "description": "Authentification validée, accès à l'app."
            }
          ]
        },
        "g4": {
          "id": "flow-4g-playvod",
          "label": "4G / HE 2 Clics — DCB (4 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "Arrivée sur la LP depuis un réseau 4G (Header Enrichment)."
            },
            {
              "title": "Clic sur 'Souscrire'",
              "description": "Clic sur le bouton Souscrire."
            },
            {
              "title": "Confirmation",
              "description": "Confirmation de l'abonnement (DCB)."
            },
            {
              "title": "Accès à l'application",
              "description": "Transaction approuvée, accès immédiat."
            }
          ]
        }
      }
    },
    {
      "id": "playweez",
      "title": "PlayWeez",
      "vertical": "CONTENT",
      "operator": "Orange Senegal",
      "format": "PARCOURS_CLIENT",
      "description": "Cartographie complète du parcours utilisateur pour le service PlayWeez.",
      "flows": {
        "wifi": {
          "id": "flow-wifi-playweez",
          "label": "Wi-Fi — PIN Code (5 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "L'utilisateur arrive sur la Landing Page depuis un réseau Wi-Fi."
            },
            {
              "title": "Saisie du téléphone",
              "description": "L'utilisateur renseigne son numéro de téléphone mobile."
            },
            {
              "title": "Réception du PIN",
              "description": "Un code PIN à usage unique (OTP) est envoyé par SMS."
            },
            {
              "title": "Saisie du code PIN",
              "description": "L'utilisateur retourne sur la LP et saisit le code PIN."
            },
            {
              "title": "Accès à l'application",
              "description": "Authentification validée, accès à l'app."
            }
          ]
        },
        "g4": {
          "id": "flow-4g-playweez",
          "label": "4G / HE 2 Clics — DCB (4 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "Arrivée sur la LP depuis un réseau 4G (Header Enrichment)."
            },
            {
              "title": "Clic sur 'Souscrire'",
              "description": "Clic sur le bouton Souscrire."
            },
            {
              "title": "Confirmation",
              "description": "Confirmation de l'abonnement (DCB)."
            },
            {
              "title": "Accès à l'application",
              "description": "Transaction approuvée, accès immédiat."
            }
          ]
        }
      }
    },
    {
      "id": "streaming-illimite",
      "title": "Streaming illimite",
      "vertical": "CONTENT",
      "operator": "Orange Senegal",
      "format": "PARCOURS_CLIENT",
      "description": "Cartographie complète du parcours utilisateur pour le service Streaming illimite.",
      "flows": {
        "wifi": {
          "id": "flow-wifi-streaming-illimite",
          "label": "Wi-Fi — PIN Code (5 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "L'utilisateur arrive sur la Landing Page depuis un réseau Wi-Fi."
            },
            {
              "title": "Saisie du téléphone",
              "description": "L'utilisateur renseigne son numéro de téléphone mobile."
            },
            {
              "title": "Réception du PIN",
              "description": "Un code PIN à usage unique (OTP) est envoyé par SMS."
            },
            {
              "title": "Saisie du code PIN",
              "description": "L'utilisateur retourne sur la LP et saisit le code PIN."
            },
            {
              "title": "Accès à l'application",
              "description": "Authentification validée, accès à l'app."
            }
          ]
        },
        "g4": {
          "id": "flow-4g-streaming-illimite",
          "label": "4G / HE 2 Clics — DCB (4 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "Arrivée sur la LP depuis un réseau 4G (Header Enrichment)."
            },
            {
              "title": "Clic sur 'Souscrire'",
              "description": "Clic sur le bouton Souscrire."
            },
            {
              "title": "Confirmation",
              "description": "Confirmation de l'abonnement (DCB)."
            },
            {
              "title": "Accès à l'application",
              "description": "Transaction approuvée, accès immédiat."
            }
          ]
        }
      }
    },
    {
      "id": "veedz-tv",
      "title": "Veedz TV",
      "vertical": "CONTENT",
      "operator": "Orange Senegal",
      "format": "PARCOURS_CLIENT",
      "description": "Cartographie complète du parcours utilisateur pour le service Veedz TV.",
      "flows": {
        "wifi": {
          "id": "flow-wifi-veedz-tv",
          "label": "Wi-Fi — PIN Code (5 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "L'utilisateur arrive sur la Landing Page depuis un réseau Wi-Fi."
            },
            {
              "title": "Saisie du téléphone",
              "description": "L'utilisateur renseigne son numéro de téléphone mobile."
            },
            {
              "title": "Réception du PIN",
              "description": "Un code PIN à usage unique (OTP) est envoyé par SMS."
            },
            {
              "title": "Saisie du code PIN",
              "description": "L'utilisateur retourne sur la LP et saisit le code PIN."
            },
            {
              "title": "Accès à l'application",
              "description": "Authentification validée, accès à l'app."
            }
          ]
        },
        "g4": {
          "id": "flow-4g-veedz-tv",
          "label": "4G / HE 2 Clics — DCB (4 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "Arrivée sur la LP depuis un réseau 4G (Header Enrichment)."
            },
            {
              "title": "Clic sur 'Souscrire'",
              "description": "Clic sur le bouton Souscrire."
            },
            {
              "title": "Confirmation",
              "description": "Confirmation de l'abonnement (DCB)."
            },
            {
              "title": "Accès à l'application",
              "description": "Transaction approuvée, accès immédiat."
            }
          ]
        }
      }
    },
    {
      "id": "weezchat",
      "title": "Weezchat",
      "vertical": "CONTENT",
      "operator": "Orange Senegal",
      "format": "PARCOURS_CLIENT",
      "description": "Cartographie complète du parcours utilisateur pour le service Weezchat.",
      "flows": {
        "wifi": {
          "id": "flow-wifi-weezchat",
          "label": "Wi-Fi — PIN Code (5 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "L'utilisateur arrive sur la Landing Page depuis un réseau Wi-Fi."
            },
            {
              "title": "Saisie du téléphone",
              "description": "L'utilisateur renseigne son numéro de téléphone mobile."
            },
            {
              "title": "Réception du PIN",
              "description": "Un code PIN à usage unique (OTP) est envoyé par SMS."
            },
            {
              "title": "Saisie du code PIN",
              "description": "L'utilisateur retourne sur la LP et saisit le code PIN."
            },
            {
              "title": "Accès à l'application",
              "description": "Authentification validée, accès à l'app."
            }
          ]
        },
        "g4": {
          "id": "flow-4g-weezchat",
          "label": "4G / HE 2 Clics — DCB (4 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "Arrivée sur la LP depuis un réseau 4G (Header Enrichment)."
            },
            {
              "title": "Clic sur 'Souscrire'",
              "description": "Clic sur le bouton Souscrire."
            },
            {
              "title": "Confirmation",
              "description": "Confirmation de l'abonnement (DCB)."
            },
            {
              "title": "Accès à l'application",
              "description": "Transaction approuvée, accès immédiat."
            }
          ]
        }
      }
    },
    {
      "id": "winfinity-by-orange",
      "title": "Winfinity by Orange",
      "vertical": "CONTENT",
      "operator": "Orange Senegal",
      "format": "PARCOURS_CLIENT",
      "description": "Cartographie complète du parcours utilisateur pour le service Winfinity by Orange.",
      "flows": {
        "wifi": {
          "id": "flow-wifi-winfinity-by-orange",
          "label": "Wi-Fi — PIN Code (5 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "L'utilisateur arrive sur la Landing Page depuis un réseau Wi-Fi."
            },
            {
              "title": "Saisie du téléphone",
              "description": "L'utilisateur renseigne son numéro de téléphone mobile."
            },
            {
              "title": "Réception du PIN",
              "description": "Un code PIN à usage unique (OTP) est envoyé par SMS."
            },
            {
              "title": "Saisie du code PIN",
              "description": "L'utilisateur retourne sur la LP et saisit le code PIN."
            },
            {
              "title": "Accès à l'application",
              "description": "Authentification validée, accès à l'app."
            }
          ]
        },
        "g4": {
          "id": "flow-4g-winfinity-by-orange",
          "label": "4G / HE 2 Clics — DCB (4 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "Arrivée sur la LP depuis un réseau 4G (Header Enrichment)."
            },
            {
              "title": "Clic sur 'Souscrire'",
              "description": "Clic sur le bouton Souscrire."
            },
            {
              "title": "Confirmation",
              "description": "Confirmation de l'abonnement (DCB)."
            },
            {
              "title": "Accès à l'application",
              "description": "Transaction approuvée, accès immédiat."
            }
          ]
        }
      }
    },
    {
      "id": "youscribe-sn",
      "title": "YouScribe SN",
      "vertical": "CONTENT",
      "operator": "Orange Senegal",
      "format": "PARCOURS_CLIENT",
      "description": "Cartographie complète du parcours utilisateur pour le service YouScribe SN.",
      "flows": {
        "wifi": {
          "id": "flow-wifi-youscribe-sn",
          "label": "Wi-Fi — PIN Code (5 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "L'utilisateur arrive sur la Landing Page depuis un réseau Wi-Fi."
            },
            {
              "title": "Saisie du téléphone",
              "description": "L'utilisateur renseigne son numéro de téléphone mobile."
            },
            {
              "title": "Réception du PIN",
              "description": "Un code PIN à usage unique (OTP) est envoyé par SMS."
            },
            {
              "title": "Saisie du code PIN",
              "description": "L'utilisateur retourne sur la LP et saisit le code PIN."
            },
            {
              "title": "Accès à l'application",
              "description": "Authentification validée, accès à l'app."
            }
          ]
        },
        "g4": {
          "id": "flow-4g-youscribe-sn",
          "label": "4G / HE 2 Clics — DCB (4 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "Arrivée sur la LP depuis un réseau 4G (Header Enrichment)."
            },
            {
              "title": "Clic sur 'Souscrire'",
              "description": "Clic sur le bouton Souscrire."
            },
            {
              "title": "Confirmation",
              "description": "Confirmation de l'abonnement (DCB)."
            },
            {
              "title": "Accès à l'application",
              "description": "Transaction approuvée, accès immédiat."
            }
          ]
        }
      }
    },
    {
      "id": "ziksen",
      "title": "Ziksen",
      "vertical": "CONTENT",
      "operator": "Orange Senegal",
      "format": "PARCOURS_CLIENT",
      "description": "Cartographie complète du parcours utilisateur pour le service Ziksen.",
      "flows": {
        "wifi": {
          "id": "flow-wifi-ziksen",
          "label": "Wi-Fi — PIN Code (5 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "L'utilisateur arrive sur la Landing Page depuis un réseau Wi-Fi."
            },
            {
              "title": "Saisie du téléphone",
              "description": "L'utilisateur renseigne son numéro de téléphone mobile."
            },
            {
              "title": "Réception du PIN",
              "description": "Un code PIN à usage unique (OTP) est envoyé par SMS."
            },
            {
              "title": "Saisie du code PIN",
              "description": "L'utilisateur retourne sur la LP et saisit le code PIN."
            },
            {
              "title": "Accès à l'application",
              "description": "Authentification validée, accès à l'app."
            }
          ]
        },
        "g4": {
          "id": "flow-4g-ziksen",
          "label": "4G / HE 2 Clics — DCB (4 étapes)",
          "steps": [
            {
              "title": "Landing Page",
              "description": "Arrivée sur la LP depuis un réseau 4G (Header Enrichment)."
            },
            {
              "title": "Clic sur 'Souscrire'",
              "description": "Clic sur le bouton Souscrire."
            },
            {
              "title": "Confirmation",
              "description": "Confirmation de l'abonnement (DCB)."
            },
            {
              "title": "Accès à l'application",
              "description": "Transaction approuvée, accès immédiat."
            }
          ]
        }
      }
    }
  ]
};
