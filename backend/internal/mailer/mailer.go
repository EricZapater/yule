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

func NewMailerFromEnv() *Mailer {
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	if port == "" {
		port = "587"
	}
	user := os.Getenv("SMTP_USER")
	pass := os.Getenv("SMTP_PASSWORD")
	if pass == "" {
		pass = os.Getenv("SMTP_PASS")
	}
	from := os.Getenv("SMTP_FROM")
	if from == "" {
		if user != "" {
			from = fmt.Sprintf("Yule Amic Invisible <%s>", user)
		} else {
			from = "Yule Amic Invisible <noreply@yule.cat>"
		}
	}

	if host != "" {
		log.Printf("📧 Mailer configurat per SMTP: %s:%s (remitent: %s)", host, port, from)
	} else {
		log.Println("ℹ️ Cap SMTP configurat (SMTP_HOST buit). Els correus i enllaços màgics es mostraran als logs.")
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
	return m.host != ""
}

// SendMagicLink envia el correu d'accés directe amb un bonic disseny nadalenc.
func (m *Mailer) SendMagicLink(toEmail, toName, magicLinkURL string) error {
	if !m.IsConfigured() {
		log.Printf("📧 [SIMULACIÓ SMTP] Magic link per a %s (%s): %s", toName, toEmail, magicLinkURL)
		return nil
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

func (m *Mailer) sendEmail(toEmail, subject, htmlBody string) error {
	addr := net.JoinHostPort(m.host, m.port)

	// Extreure l'adreça de correu del remitent (per exemple de "Nom <mail@domini.cat>" -> "mail@domini.cat")
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

	var auth smtp.Auth
	if m.user != "" && m.pass != "" {
		auth = smtp.PlainAuth("", m.user, m.pass, m.host)
	}

	// Port 465 utilitza SSL/TLS directe
	if m.port == "465" {
		tlsConfig := &tls.Config{
			ServerName: m.host,
		}
		conn, err := tls.Dial("tcp", addr, tlsConfig)
		if err != nil {
			return fmt.Errorf("error tls dial a %s: %w", addr, err)
		}
		defer conn.Close()

		client, err := smtp.NewClient(conn, m.host)
		if err != nil {
			return fmt.Errorf("error creant client smtp tls: %w", err)
		}
		defer client.Close()

		if auth != nil {
			if ok, _ := client.Extension("AUTH"); ok {
				if err = client.Auth(auth); err != nil {
					return fmt.Errorf("error autenticant smtp: %w", err)
				}
			}
		}

		if err = client.Mail(fromAddr); err != nil {
			return fmt.Errorf("error smtp mail from: %w", err)
		}
		if err = client.Rcpt(toEmail); err != nil {
			return fmt.Errorf("error smtp rcpt to: %w", err)
		}

		w, err := client.Data()
		if err != nil {
			return fmt.Errorf("error smtp data writer: %w", err)
		}
		if _, err = w.Write([]byte(message)); err != nil {
			return fmt.Errorf("error escrivint missatge smtp: %w", err)
		}
		return w.Close()
	}

	// Ports 587 o 25 (amb STARTTLS si és suportat)
	return smtp.SendMail(addr, auth, fromAddr, []string{toEmail}, []byte(message))
}
