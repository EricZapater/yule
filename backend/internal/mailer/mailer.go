package mailer

import (
	"crypto/tls"
	"fmt"
	"log"
	"net"
	"net/smtp"
	"os"
	"strings"
	"time"
)

type Mailer struct {
	host string
	port string
	user string
	pass string
	from string
}

// loginAuth implementa l'autenticació AUTH LOGIN requerida per molts servidors SMTP (cPanel, Microsoft, etc.)
type loginAuth struct {
	username, password string
}

func LoginAuth(username, password string) smtp.Auth {
	return &loginAuth{username, password}
}

func (a *loginAuth) Start(server *smtp.ServerInfo) (string, []byte, error) {
	return "LOGIN", []byte(a.username), nil
}

func (a *loginAuth) Next(fromServer []byte, more bool) ([]byte, error) {
	if more {
		prompt := strings.ToLower(strings.TrimSpace(string(fromServer)))
		switch {
		case strings.HasPrefix(prompt, "username") || strings.Contains(prompt, "user"):
			return []byte(a.username), nil
		case strings.HasPrefix(prompt, "password") || strings.Contains(prompt, "pass"):
			return []byte(a.password), nil
		default:
			// Fallback: si el servidor envia un repte desconegut
			return []byte(a.username), nil
		}
	}
	return nil, nil
}

func NewMailerFromEnv() *Mailer {
	host := strings.TrimSpace(os.Getenv("SMTP_HOST"))
	port := strings.TrimSpace(os.Getenv("SMTP_PORT"))
	if port == "" {
		port = "587"
	}
	user := strings.TrimSpace(os.Getenv("SMTP_USER"))
	pass := strings.TrimSpace(os.Getenv("SMTP_PASSWORD"))
	if pass == "" {
		pass = strings.TrimSpace(os.Getenv("SMTP_PASS"))
	}
	from := strings.TrimSpace(os.Getenv("SMTP_FROM"))
	if from == "" {
		if user != "" {
			from = fmt.Sprintf("Yule Amic Invisible <%s>", user)
		} else {
			from = "Yule Amic Invisible <noreply@yule.cat>"
		}
	}

	if host != "" {
		log.Printf("📧 [SMTP CONFIGURAT] Host=%s:%s, Usuari=%s, Remitent=%s", host, port, user, from)
	} else {
		log.Println("ℹ️ [SENSE SMTP] SMTP_HOST buit. Els Magic Links es mostraran als logs del contenidor.")
	}

	return &Mailer{
		host: host,
		port: port,
		user: user,
		pass: pass,
		from: from,
	}
}

func (m *Mailer) IsConfigured() bool {
	return m != nil && m.host != ""
}

// SendMagicLink envia el correu d'accés directe amb un bonic disseny nadalenc.
func (m *Mailer) SendMagicLink(toEmail, toName, magicLinkURL string) error {
	if !m.IsConfigured() {
		return fmt.Errorf("SMTP no està configurat (SMTP_HOST està buit a l'entorn del contenidor)")
	}

	if toName == "" {
		toName = "Familiar"
	}

	subject := "🎄 El teu enllaç d'accés màgic a l'Amic Invisible (Yule)"

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fdfaf6; margin: 0; padding: 24px; color: #1f2937; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border: 2px solid #d4af37; border-radius: 12px; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .header { text-align: center; margin-bottom: 24px; }
    .header h1 { color: #1b4332; margin: 8px 0 0; font-size: 26px; }
    .btn { display: inline-block; background-color: #1b4332; color: #ffffff !important; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 8px; margin: 24px 0; border: 1px solid #d4af37; text-align: center; }
    .footer { font-size: 12px; color: #6b7280; text-align: center; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div style="font-size: 42px;">🎄</div>
      <h1>Amic Invisible Familiar</h1>
    </div>
    <p>Hola <strong>%s</strong>,</p>
    <p>Hem preparat el teu accés directe a <strong>Yule</strong> per a l'edició de Nadal d'aquest any. Clica al botó següent per entrar sense contrasenya i preparar la teva llista de desitjos:</p>
    <div style="text-align: center;">
      <a href="%s" class="btn">Entrar a l'Amic Invisible ✨</a>
    </div>
    <p style="font-size: 13px; color: #6b7280;">Si el botó no et funciona, pots copiar i enganxar aquest enllaç al teu navegador:<br>
      <a href="%s" style="color: #1b4332; word-break: break-all;">%s</a>
    </p>
    <div class="footer">
      Aquest enllaç és d'ús exclusiu i caduca en 24 hores.<br>
      Bones Festes! 🎅🎁
    </div>
  </div>
</body>
</html>`, toName, magicLinkURL, magicLinkURL, magicLinkURL)

	return m.sendEmail(toEmail, subject, htmlBody)
}

// SendDrawNotification envia el correu festiu revelant qui és la persona assignada a l'amic invisible.
func (m *Mailer) SendDrawNotification(toEmail, giverName, receiverName, editionName string, budgetLimit float64, appURL string) error {
	if !m.IsConfigured() {
		return fmt.Errorf("SMTP no està configurat")
	}

	if giverName == "" {
		giverName = "Familiar"
	}

	budgetInfo := ""
	if budgetLimit > 0 {
		budgetInfo = fmt.Sprintf(`<div style="background: #faf4e8; border: 1px solid #ebd8b2; border-radius: 8px; padding: 12px; margin: 16px 0; text-align: center;">
          <span style="font-size: 13px; color: #6d4e00; font-weight: bold; text-transform: uppercase;">Pressupost màxim orientatiu:</span>
          <div style="font-size: 20px; font-weight: 800; color: #1b4332; margin-top: 4px;">%.2f €</div>
        </div>`, budgetLimit)
	}

	subject := fmt.Sprintf("🎁 Ja saps a qui regales! Sorteig celebrat (%s)", editionName)

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fdfaf6; margin: 0; padding: 24px; color: #1f2937; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border: 2px solid #d4af37; border-radius: 12px; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .header { text-align: center; margin-bottom: 24px; }
    .header h1 { color: #1b4332; margin: 8px 0 0; font-size: 26px; }
    .target-box { background: #faf8f5; border: 2px solid #d4af37; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
    .target-name { font-size: 28px; font-weight: 800; color: #9d0208; margin-top: 6px; }
    .btn { display: inline-block; background-color: #1b4332; color: #ffffff !important; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 8px; margin: 16px 0; border: 1px solid #d4af37; text-align: center; }
    .footer { font-size: 12px; color: #6b7280; text-align: center; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div style="font-size: 42px;">🎄🎁</div>
      <h1>El Sorteig s'ha Celebrat!</h1>
      <p style="color: #6b7280; margin: 4px 0 0; font-size: 14px;">%s</p>
    </div>
    <p>Hola <strong>%s</strong>,</p>
    <p>L'administrador de la família ha celebrat el sorteig de l'Amic Invisible i les parelles secretes ja han quedat assignades.</p>
    
    <div class="target-box">
      <div style="font-size: 13px; color: #9d0208; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Aquest Nadal et toca regalar a...</div>
      <div class="target-name">✨ %s ✨</div>
    </div>

    %s

    <p>Pots consultar la seva <strong>llista de desitjos, idees i fotos</strong> directament a l'aplicació per encertar amb el regal:</p>
    
    <div style="text-align: center;">
      <a href="%s" class="btn">Veure la llista de desitjos de %s 🎁</a>
    </div>

    <div class="footer">
      Recorda mantenir el secret fins al dia de l'entrega!<br>
      Bones Festes i feliç Yule! 🎅✨
    </div>
  </div>
</body>
</html>`, editionName, giverName, receiverName, budgetInfo, appURL, receiverName)

	return m.sendEmail(toEmail, subject, htmlBody)
}

func (m *Mailer) sendEmail(toEmail, subject, htmlBody string) error {
	addr := net.JoinHostPort(m.host, m.port)

	fromAddr := m.from
	if start := strings.Index(m.from, "<"); start != -1 {
		if end := strings.Index(m.from, ">"); end > start {
			fromAddr = m.from[start+1 : end]
		}
	}

	headers := make(map[string]string)
	headers["From"] = m.from
	headers["To"] = toEmail
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"
	headers["Date"] = time.Now().Format(time.RFC1123Z)

	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + htmlBody

	dialer := &net.Dialer{Timeout: 15 * time.Second}

	// Port 465: connexió directa TLS
	if m.port == "465" {
		tlsConfig := &tls.Config{
			ServerName: m.host,
		}
		conn, err := tls.DialWithDialer(dialer, "tcp", addr, tlsConfig)
		if err != nil {
			return fmt.Errorf("error tls dial a %s (15s timeout): %w", addr, err)
		}
		defer conn.Close()

		client, err := smtp.NewClient(conn, m.host)
		if err != nil {
			return fmt.Errorf("error creant client smtp tls: %w", err)
		}
		defer client.Close()

		return m.authenticateAndSend(client, fromAddr, toEmail, []byte(message))
	}

	// Ports 587 o 25 (Connexió TCP estàndard amb STARTTLS)
	conn, err := dialer.Dial("tcp", addr)
	if err != nil {
		return fmt.Errorf("error connectant a %s (15s timeout): %w", addr, err)
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, m.host)
	if err != nil {
		return fmt.Errorf("error iniciant sessió smtp: %w", err)
	}
	defer client.Close()

	// Intentar STARTTLS si el servidor ho suporta
	if ok, _ := client.Extension("STARTTLS"); ok {
		tlsConfig := &tls.Config{
			ServerName: m.host,
		}
		if err = client.StartTLS(tlsConfig); err != nil {
			return fmt.Errorf("error negociant STARTTLS amb %s: %w", m.host, err)
		}
	}

	return m.authenticateAndSend(client, fromAddr, toEmail, []byte(message))
}

func (m *Mailer) authenticateAndSend(client *smtp.Client, fromAddr, toEmail string, message []byte) error {
	// Autenticació si tenim credencials
	if m.user != "" && m.pass != "" {
		if ok, auths := client.Extension("AUTH"); ok {
			upperAuths := strings.ToUpper(auths)
			var auth smtp.Auth

			if strings.Contains(upperAuths, "PLAIN") {
				auth = smtp.PlainAuth("", m.user, m.pass, m.host)
			} else if strings.Contains(upperAuths, "LOGIN") {
				auth = LoginAuth(m.user, m.pass)
			} else {
				// Prova PlainAuth per defecte
				auth = smtp.PlainAuth("", m.user, m.pass, m.host)
			}

			if err := client.Auth(auth); err != nil {
				// Si PlainAuth falla, provem LoginAuth com a fallback
				if fallbackErr := client.Auth(LoginAuth(m.user, m.pass)); fallbackErr != nil {
					return fmt.Errorf("error autenticant a l'SMTP (%s): %w", m.host, err)
				}
			}
		}
	}

	if err := client.Mail(fromAddr); err != nil {
		return fmt.Errorf("error especificant remitent (%s): %w", fromAddr, err)
	}
	if err := client.Rcpt(toEmail); err != nil {
		return fmt.Errorf("error especificant destinatari (%s): %w", toEmail, err)
	}

	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("error obrint canal de dades: %w", err)
	}
	if _, err = w.Write(message); err != nil {
		return fmt.Errorf("error escrivint el cos del missatge: %w", err)
	}
	return w.Close()
}
