package com.cgm.infolab.service;

import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.model.VisibilityEnum;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.model.LastMessageDto;
import com.cgm.infolab.model.RoomDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class RoomService {
    private final ChatService chatService;
    private final RoomRepository roomRepository;

    private final Logger log = LoggerFactory.getLogger(RoomService.class);

    @Autowired
    public RoomService(ChatService chatService, RoomRepository roomRepository) {
        this.chatService = chatService;
        this.roomRepository = roomRepository;
    }

    public RoomDto fromEntityToDto(RoomEntity roomEntity) {
        RoomDto roomDto = RoomDto.of(roomEntity.getName());

        LastMessageDto message = chatService.fromEntityToLastMessageDto(roomEntity.getMessages().get(0));

        roomDto.setLastMessage(message);

        return roomDto;
    }

    public List<RoomDto> getRooms(String date, Username username) {
        List<RoomDto> roomDtos = new ArrayList<>();

        List<RoomEntity> roomEntities = roomRepository.getAfterDate(fromStringToDate(date), username);

        if (roomEntities.size() > 0) {
            roomDtos = roomEntities.stream().map(this::fromEntityToDto).toList();
        } else {
            log.info("Non sono state trovate room");
        }

        return roomDtos;
    }

    private LocalDate fromStringToDate(String date) {
        if (date == null) {
            return null;
        } else {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            return LocalDate.parse(date, formatter);
        }
    }

    public RoomEntity createPrivateRoom(Username user1, Username user2) {
        String[] users = {user1.value(), user2.value()};
        Arrays.sort(users);
        // Il criterio con cui vengono create le room è mettere i nomi degli utenti in ordine lessicografico,
        // in modo da evitare room multiple tra gli stessi utenti
        String roomName = String.format("%s-%s", users[0], users[1]);

        try {
            long roomId = roomRepository.add(RoomEntity.of(roomName, VisibilityEnum.PRIVATE));
            return RoomEntity.of(roomId, roomName, VisibilityEnum.PRIVATE);
        } catch (DuplicateKeyException e) {
            log.info(String.format("Room roomName=\"%s\" già esistente nel database", roomName));
            return roomRepository.getByRoomNameEvenIfNotSubscribed(roomName).orElseGet(() -> null);
        }
    }
}
