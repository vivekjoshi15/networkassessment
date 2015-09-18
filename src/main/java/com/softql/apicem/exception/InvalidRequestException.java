/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.softql.apicem.exception;

import org.springframework.validation.BindingResult;

/**
 *
 * @author  Ramesh
 */
public class InvalidRequestException extends RuntimeException {

    private BindingResult errors;

    public InvalidRequestException(BindingResult errors) {
        this.errors = errors;
    }

    public BindingResult getErrors() {
        return errors;
    }

}
