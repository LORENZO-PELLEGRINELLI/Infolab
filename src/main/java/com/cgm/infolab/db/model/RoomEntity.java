package com.cgm.infolab.db.model;

import com.cgm.infolab.db.ID;

public class RoomEntity {
    private long id;
    private String name;

    private RoomEntity(long id, String name) {
        this.id = id;
        this.name = name;
    }

    public static RoomEntity of(String name) {
        return new RoomEntity(ID.None, name);
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
