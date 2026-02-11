package com.uniconnect.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import com.uniconnect.websocket.ChatWebSocketHandler;
import com.uniconnect.websocket.EventsClubsWebSocketHandler;
import com.uniconnect.websocket.ReelWebSocketHandler;

/**
 * WebSocket Configuration for real-time messaging and events/clubs updates
 * Enables WebSocket support and registers handlers for chat and events/clubs functionality
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final ChatWebSocketHandler chatWebSocketHandler;
    private final EventsClubsWebSocketHandler eventsClubsWebSocketHandler;
    private final ReelWebSocketHandler reelWebSocketHandler;

    public WebSocketConfig(ChatWebSocketHandler chatWebSocketHandler,
                           EventsClubsWebSocketHandler eventsClubsWebSocketHandler,
                           ReelWebSocketHandler reelWebSocketHandler) {
        this.chatWebSocketHandler = chatWebSocketHandler;
        this.eventsClubsWebSocketHandler = eventsClubsWebSocketHandler;
        this.reelWebSocketHandler = reelWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Raw WebSocket endpoint for chat (used by frontend native WebSocket)
        registry.addHandler(chatWebSocketHandler, "/ws/chat")
                .setAllowedOriginPatterns("*");

        // SockJS fallback endpoint for chat
        registry.addHandler(chatWebSocketHandler, "/ws/chat-sockjs")
                .setAllowedOriginPatterns("*")
                .withSockJS();
        
        registry.addHandler(eventsClubsWebSocketHandler, "/ws/events-clubs")
                .setAllowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*");

        registry.addHandler(reelWebSocketHandler, "/ws/reels")
                .setAllowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*")
                .withSockJS();
    }
}
