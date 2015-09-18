/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.softql.apicem.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.RestTemplate;

import com.softql.apicem.model.DeviceDetails;
import com.softql.apicem.model.DeviceQuestionare;
import com.softql.apicem.model.DiscoveryDevices;
import com.softql.apicem.model.Questionare;
import com.softql.apicem.model.ReachabilityDevice;
import com.softql.apicem.model.ReachabilityInfo;
import com.softql.apicem.util.IPAddressUtils;

/**
 *
 * @author
 */
@Service
public class EmailService {	

	String from = "Vivek@softql.com";
    String host = "gator4137.hostgator.com";
    String username = "Vivek@softql.com";
    String password = "Vivek123";
    
	public String sendEmail(String subject, String emailBody, String To) {
		String response="";
		String to = To;       
        
      //Get the session object  
        Properties props = new Properties();  
        props.put("mail.smtp.host",host);  
        props.put("mail.smtp.auth", "true");  
          
        Session session = Session.getDefaultInstance(props,  
         new javax.mail.Authenticator() {  
           protected PasswordAuthentication getPasswordAuthentication() {  
         return new PasswordAuthentication(username,password);  
           }  
         });  

        try{
           MimeMessage message = new MimeMessage(session);
           message.setFrom(new InternetAddress(from));
           message.addRecipient(Message.RecipientType.TO,
                                    new InternetAddress(to));
           message.setSubject(subject);
           message.setText(emailBody);

           Transport.send(message);
           response="Email Sent successfully....";
        }catch (MessagingException mex) {
        	//mex.printStackTrace();
        	response="Error Sending Email";
        }
        
        return response;
	}
}
