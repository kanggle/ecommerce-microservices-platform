package com.example.order.domain.model;

import lombok.Getter;

@Getter
public class ShippingAddress {

    private String recipient;
    private String phone;
    private String zipCode;
    private String address1;
    private String address2;

    private ShippingAddress() {
    }

    public ShippingAddress(String recipient, String phone, String zipCode,
                           String address1, String address2) {
        if (recipient == null || recipient.isBlank()) throw new IllegalArgumentException("recipient must not be blank");
        if (phone == null || phone.isBlank()) throw new IllegalArgumentException("phone must not be blank");
        if (zipCode == null || zipCode.isBlank()) throw new IllegalArgumentException("zipCode must not be blank");
        if (address1 == null || address1.isBlank()) throw new IllegalArgumentException("address1 must not be blank");
        this.recipient = recipient;
        this.phone = phone;
        this.zipCode = zipCode;
        this.address1 = address1;
        this.address2 = address2;
    }

    public static ShippingAddress reconstitute(String recipient, String phone, String zipCode,
                                                String address1, String address2) {
        ShippingAddress sa = new ShippingAddress();
        sa.recipient = recipient;
        sa.phone = phone;
        sa.zipCode = zipCode;
        sa.address1 = address1;
        sa.address2 = address2;
        return sa;
    }
}
