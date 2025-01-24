package com.ssafy.codemaestro.domain.verify.service;

import com.ssafy.codemaestro.domain.auth.util.MailUtil;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MailService {
    MailUtil mailUtil;

    @Autowired
    public MailService(MailUtil mailUtil) {
        this.mailUtil = mailUtil;
    }

    public void sendMail(String to, String subject, String content) {
        try {
            mailUtil.send(to, subject, content);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
}
