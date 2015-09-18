/*
 * Decompiled with CFR 0_101.
 * 
 * Could not load the following classes:
 *  javax.inject.Inject
 *  org.springframework.context.MessageSource
 */
package com.softql.apicem.api.controller;

import javax.inject.Inject;
import org.springframework.context.MessageSource;

public class BaseRestController {
    @Inject
    public MessageSource messageSource;
}
