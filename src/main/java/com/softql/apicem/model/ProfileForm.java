/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.softql.apicem.model;

import java.io.Serializable;

/**
 *
 * @author 
 */
public class ProfileForm implements Serializable{
    
    private String name;
    
    private String email;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public String toString() {
        return "UserForm{" + "name=" + name + ", email=" + email + '}';
    }
}
